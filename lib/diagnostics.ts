import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProducts, type Product } from "@/lib/products";
import { getOrders } from "@/lib/orders";
import { getLowStockProducts, getStockHistory } from "@/lib/inventory";
import { getIntelligenceOverview, SOLD_STATUSES } from "@/lib/intelligence";

// "What Changed" diagnostic layer -- Phase 1 of the cross-tool context work.
// Everything here is derived from data this app already owns (products,
// orders, inventory, readiness). No external ad/analytics/marketplace APIs
// are involved -- see the plan doc for the phased roadmap on those.

export interface DailySnapshot {
  snapshotDate: string;
  avgReadinessScore: number;
  totalViews: number;
  totalRevenue: number;
  orderCount: number;
  lowStockCount: number;
}

interface SnapshotRow {
  snapshot_date: string;
  avg_readiness_score: number;
  total_views: number;
  total_revenue: number | string;
  order_count: number;
  low_stock_count: number;
}

function mapSnapshotRow(row: SnapshotRow): DailySnapshot {
  return {
    snapshotDate: row.snapshot_date,
    avgReadinessScore: row.avg_readiness_score,
    totalViews: row.total_views,
    totalRevenue: Number(row.total_revenue),
    orderCount: row.order_count,
    lowStockCount: row.low_stock_count,
  };
}

function dateStringDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function todayDateString(): string {
  return dateStringDaysAgo(0);
}

/**
 * Writes today's snapshot if one doesn't already exist for this workspace.
 * No cron exists in this app -- call this opportunistically (e.g. when the
 * diagnostics page or dashboard is visited). Idempotent via the
 * unique(workspace_id, snapshot_date) constraint + upsert, so calling it
 * twice in one day is safe.
 */
export async function ensureTodaySnapshot(workspaceId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const today = todayDateString();

  const { data: existing } = await supabase
    .from("workspace_daily_snapshots")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("snapshot_date", today)
    .maybeSingle();

  if (existing) return;

  const [products, overview, lowStock, orders] = await Promise.all([
    getProducts(workspaceId),
    getIntelligenceOverview(workspaceId),
    getLowStockProducts(workspaceId),
    getOrders(workspaceId),
  ]);

  const avgReadinessScore = overview.readiness.products.length
    ? Math.round(
        overview.readiness.products.reduce((sum, p) => sum + p.averageScore, 0) /
          overview.readiness.products.length
      )
    : 0;
  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const soldOrders = orders.filter((o) => SOLD_STATUSES.has(o.status));
  const totalRevenue = soldOrders.reduce((sum, o) => sum + o.total, 0);

  const { error } = await supabase.from("workspace_daily_snapshots").upsert(
    {
      workspace_id: workspaceId,
      snapshot_date: today,
      avg_readiness_score: avgReadinessScore,
      total_views: totalViews,
      total_revenue: totalRevenue,
      order_count: soldOrders.length,
      low_stock_count: lowStock.length,
    },
    { onConflict: "workspace_id,snapshot_date" }
  );

  if (error) {
    throw new Error(`Failed to write daily snapshot: ${error.message}`);
  }
}

export interface WeekOverWeekComparison {
  /** False until a snapshot from ~a week ago actually exists -- never a fabricated baseline. */
  available: boolean;
  current?: DailySnapshot;
  previous?: DailySnapshot;
  deltas?: {
    revenue: number;
    revenuePercent: number | null;
    orders: number;
    views: number;
    readiness: number;
  };
}

export async function getWeekOverWeekComparison(workspaceId: string): Promise<WeekOverWeekComparison> {
  const supabase = getSupabaseServerClient();
  const today = todayDateString();

  const { data: currentRow } = await supabase
    .from("workspace_daily_snapshots")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("snapshot_date", today)
    .maybeSingle();

  if (!currentRow) {
    return { available: false };
  }

  // Nearest snapshot 6-8 days back, whichever actually exists.
  const { data: previousRows } = await supabase
    .from("workspace_daily_snapshots")
    .select("*")
    .eq("workspace_id", workspaceId)
    .gte("snapshot_date", dateStringDaysAgo(8))
    .lte("snapshot_date", dateStringDaysAgo(6))
    .order("snapshot_date", { ascending: true })
    .limit(1);

  const previousRow = previousRows?.[0];
  const current = mapSnapshotRow(currentRow as SnapshotRow);

  if (!previousRow) {
    return { available: false, current };
  }

  const previous = mapSnapshotRow(previousRow as SnapshotRow);

  return {
    available: true,
    current,
    previous,
    deltas: {
      revenue: current.totalRevenue - previous.totalRevenue,
      revenuePercent:
        previous.totalRevenue > 0
          ? Math.round(((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100)
          : null,
      orders: current.orderCount - previous.orderCount,
      views: current.totalViews - previous.totalViews,
      readiness: current.avgReadinessScore - previous.avgReadinessScore,
    },
  };
}

export interface ProductMover {
  product: Product;
  revenueLast7Days: number;
  revenuePrior7Days: number;
  revenueChange: number;
  unitsLast7Days: number;
  readinessScore: number;
  currentStock: number | null;
  /** Sum of stock_adjustments deltas in the last 7 days; null if inventory isn't tracked for this product. */
  recentStockChange: number | null;
}

/**
 * The direct answer to the "sales dropped -> check products -> check
 * inventory -> check readiness -> figure out why" manual workflow: ranks
 * products by how much their real order revenue swung week-over-week, and
 * attaches the real context (stock level, recent stock changes, readiness
 * score) a human needs to judge why -- without guessing at a cause itself.
 */
export async function getProductMovers(workspaceId: string, limit = 10): Promise<ProductMover[]> {
  const [products, orders, overview] = await Promise.all([
    getProducts(workspaceId),
    getOrders(workspaceId),
    getIntelligenceOverview(workspaceId),
  ]);

  const readinessByProductId = new Map(overview.readiness.products.map((p) => [p.product.id, p.averageScore]));

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const last7Start = now - sevenDaysMs;
  const prior7Start = now - sevenDaysMs * 2;

  const revenueLast7 = new Map<string, number>();
  const revenuePrior7 = new Map<string, number>();
  const unitsLast7 = new Map<string, number>();

  for (const order of orders) {
    if (!SOLD_STATUSES.has(order.status)) continue;
    const createdAt = new Date(order.createdAt).getTime();
    for (const item of order.items) {
      if (!item.productId) continue;
      if (createdAt >= last7Start) {
        revenueLast7.set(item.productId, (revenueLast7.get(item.productId) ?? 0) + item.lineTotal);
        unitsLast7.set(item.productId, (unitsLast7.get(item.productId) ?? 0) + item.quantity);
      } else if (createdAt >= prior7Start) {
        revenuePrior7.set(item.productId, (revenuePrior7.get(item.productId) ?? 0) + item.lineTotal);
      }
    }
  }

  const movers = products
    .map((product) => {
      const revenueLast7Days = revenueLast7.get(product.id) ?? 0;
      const revenuePrior7Days = revenuePrior7.get(product.id) ?? 0;
      return {
        product,
        revenueLast7Days,
        revenuePrior7Days,
        revenueChange: revenueLast7Days - revenuePrior7Days,
        unitsLast7Days: unitsLast7.get(product.id) ?? 0,
        readinessScore: readinessByProductId.get(product.id) ?? 0,
        currentStock: product.trackInventory ? product.stockQuantity : null,
        recentStockChange: null as number | null,
      };
    })
    .filter((m) => m.revenueLast7Days > 0 || m.revenuePrior7Days > 0)
    .sort((a, b) => Math.abs(b.revenueChange) - Math.abs(a.revenueChange))
    .slice(0, limit);

  // Only fetch stock history for the movers actually being shown, not every product.
  return Promise.all(
    movers.map(async (mover) => {
      if (!mover.product.trackInventory) return mover;
      const history = await getStockHistory(mover.product.id, workspaceId);
      const recentStockChange = history
        .filter((h) => new Date(h.createdAt).getTime() >= last7Start)
        .reduce((sum, h) => sum + h.delta, 0);
      return { ...mover, recentStockChange };
    })
  );
}

export interface ProductPerformance {
  revenueLast7Days: number;
  revenuePrior7Days: number;
  revenueChange: number;
  revenueChangePercent: number | null;
  unitsLast7Days: number;
  totalRevenue: number;
  totalUnitsSold: number;
  orderCount: number;
}

/**
 * The single-product version of getProductMovers -- real order history
 * scoped to one listing, same 7-day-swing math, for the product detail
 * page's "how is this listing actually performing" panel.
 */
export async function getProductPerformance(productId: string, workspaceId: string): Promise<ProductPerformance> {
  const orders = await getOrders(workspaceId);

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const last7Start = now - sevenDaysMs;
  const prior7Start = now - sevenDaysMs * 2;

  let revenueLast7Days = 0;
  let revenuePrior7Days = 0;
  let unitsLast7Days = 0;
  let totalRevenue = 0;
  let totalUnitsSold = 0;
  let orderCount = 0;

  for (const order of orders) {
    if (!SOLD_STATUSES.has(order.status)) continue;
    const createdAt = new Date(order.createdAt).getTime();
    let touchedThisOrder = false;

    for (const item of order.items) {
      if (item.productId !== productId) continue;
      touchedThisOrder = true;
      totalRevenue += item.lineTotal;
      totalUnitsSold += item.quantity;
      if (createdAt >= last7Start) {
        revenueLast7Days += item.lineTotal;
        unitsLast7Days += item.quantity;
      } else if (createdAt >= prior7Start) {
        revenuePrior7Days += item.lineTotal;
      }
    }

    if (touchedThisOrder) orderCount++;
  }

  const revenueChange = revenueLast7Days - revenuePrior7Days;

  return {
    revenueLast7Days,
    revenuePrior7Days,
    revenueChange,
    revenueChangePercent: revenuePrior7Days > 0 ? Math.round((revenueChange / revenuePrior7Days) * 100) : null,
    unitsLast7Days,
    totalRevenue,
    totalUnitsSold,
    orderCount,
  };
}
