import "server-only";
import { getProducts, type Product } from "@/lib/products";
import { getOrders, type OrderStatus } from "@/lib/orders";
import {
  getReadinessOverview,
  rollupReadinessByFolder,
  type ReadinessOverview,
} from "@/lib/readiness";

// Cross-domain "product intelligence" signals -- the one module allowed to
// combine products + orders + readiness, so lib/readiness.ts and
// lib/orders.ts can each stay domain-clean.

/**
 * Order statuses that represent a real completed/in-flight sale for the
 * conversion-gap signal. "cancelled" is excluded -- stock was restored, so
 * counting it as a sale would be dishonest about what actually sold.
 */
const SOLD_STATUSES = new Set<OrderStatus>(["open", "paid", "fulfilled", "refunded"]);

// Self-relative "high traffic" threshold (confirmed decision, not an
// invented absolute benchmark): a product counts as high-traffic if its
// views exceed 1.5x the workspace's own average views across its catalog,
// with a floor of 10 views so a tiny catalog with a handful of views each
// doesn't produce noisy signals.
const HIGH_TRAFFIC_MULTIPLIER = 1.5;
const HIGH_TRAFFIC_VIEWS_FLOOR = 10;

// Reuses the existing scoreVariant thresholds from the readiness page
// ("success" >= 80, "destructive" < 50) so this signal doesn't invent a
// second scale for the same underlying score.
const READY_SCORE_THRESHOLD = 80;
const LOW_READINESS_SCORE_THRESHOLD = 50;

export interface ConversionGapSignal {
  product: Product;
  views: number;
  unitsSold: number;
  readinessScore: number;
  /**
   * "high-traffic-zero-sales": the listing looks fine (readiness >= 80) and
   * gets above-average traffic, but nothing sold -- something other than
   * the listing itself (price, photos' persuasiveness, etc.) is the likely
   * blocker; this tool is honest that it can't diagnose which.
   * "low-readiness-zero-sales": the listing is genuinely incomplete
   * (readiness < 50) and nothing sold -- fixing the listing is the
   * actionable next step.
   */
  classification: "high-traffic-zero-sales" | "low-readiness-zero-sales";
}

// Exported (in addition to the two public entry points below) so the
// aggregation/classification math can be sanity-checked directly against
// in-memory fixtures without hitting Supabase.
export function computeUnitsSoldByProduct(orders: Awaited<ReturnType<typeof getOrders>>): Map<string, number> {
  const unitsSoldByProduct = new Map<string, number>();
  for (const order of orders) {
    if (!SOLD_STATUSES.has(order.status)) continue;
    for (const item of order.items) {
      if (!item.productId) continue;
      unitsSoldByProduct.set(item.productId, (unitsSoldByProduct.get(item.productId) ?? 0) + item.quantity);
    }
  }
  return unitsSoldByProduct;
}

export function classifyConversionGaps(
  products: Product[],
  readinessByProductId: Map<string, number>,
  unitsSoldByProduct: Map<string, number>
): ConversionGapSignal[] {
  if (products.length === 0) return [];

  const totalViews = products.reduce((sum, p) => sum + p.views, 0);
  const averageViews = totalViews / products.length;
  const highTrafficThreshold = Math.max(averageViews * HIGH_TRAFFIC_MULTIPLIER, HIGH_TRAFFIC_VIEWS_FLOOR);

  const signals: ConversionGapSignal[] = [];
  for (const product of products) {
    const unitsSold = unitsSoldByProduct.get(product.id) ?? 0;
    if (unitsSold > 0) continue;

    const readinessScore = readinessByProductId.get(product.id) ?? 0;
    const isHighTraffic = product.views > highTrafficThreshold;

    if (isHighTraffic && readinessScore >= READY_SCORE_THRESHOLD) {
      signals.push({
        product,
        views: product.views,
        unitsSold,
        readinessScore,
        classification: "high-traffic-zero-sales",
      });
    } else if (readinessScore < LOW_READINESS_SCORE_THRESHOLD) {
      signals.push({
        product,
        views: product.views,
        unitsSold,
        readinessScore,
        classification: "low-readiness-zero-sales",
      });
    }
    // Everything else (low-traffic zero-sales, mid-range readiness) is
    // deliberately excluded rather than force-classified into one of the
    // two buckets above -- keeps the signal honest instead of exhaustive.
  }

  return signals;
}

/**
 * Cross-references products.views, real orders/order_items, and the
 * readiness score to surface products that sold zero units despite either
 * (a) looking traffic-worthy and listing-complete, or (b) being genuinely
 * incomplete listings. Phase 1 approach: order_items has no direct
 * workspace_id (only reachable via orders.workspace_id), so this calls the
 * existing scoped getOrders(workspaceId) and reduces quantity by
 * product_id in memory -- fine at current catalog sizes; a Postgres
 * view/RPC is a future optimization, not needed now.
 */
export async function getConversionGapSignals(workspaceId: string): Promise<ConversionGapSignal[]> {
  const products = await getProducts(workspaceId);
  if (products.length === 0) return [];

  const [readiness, orders] = await Promise.all([
    getReadinessOverview(products, workspaceId),
    getOrders(workspaceId),
  ]);

  const readinessByProductId = new Map(readiness.products.map((s) => [s.product.id, s.averageScore]));
  const unitsSoldByProduct = computeUnitsSoldByProduct(orders);

  return classifyConversionGaps(products, readinessByProductId, unitsSoldByProduct);
}

/**
 * Single fetch for both /dashboard and /readiness so they stay consistent.
 * Fetches products, readiness, and orders once each and derives the folder
 * rollup + conversion-gap signals from that same data (rather than calling
 * getConversionGapSignals separately, which would recompute readiness).
 */
export async function getIntelligenceOverview(workspaceId: string): Promise<{
  readiness: ReadinessOverview;
  folderRollup: ReturnType<typeof rollupReadinessByFolder>;
  conversionGaps: ConversionGapSignal[];
}> {
  const products = await getProducts(workspaceId);
  const [readiness, orders] = await Promise.all([
    getReadinessOverview(products, workspaceId),
    getOrders(workspaceId),
  ]);

  const folderRollup = rollupReadinessByFolder(readiness.products);
  const readinessByProductId = new Map(readiness.products.map((s) => [s.product.id, s.averageScore]));
  const unitsSoldByProduct = computeUnitsSoldByProduct(orders);
  const conversionGaps = classifyConversionGaps(products, readinessByProductId, unitsSoldByProduct);

  return { readiness, folderRollup, conversionGaps };
}

// -- Deep-linking into /products (A4) -----------------------------------
//
// One routing mechanism serves both the Top-Blockers "fix now" links and
// the folder-rollup "view this folder's products" links: ProductsPage
// reads `view`/`ids`/`folder` searchParams and ProductsListClient seeds its
// state from them.

/** Above this many explicit product ids, fall back to an unfiltered grid view instead of an unwieldy query string. */
const MAX_LINKED_PRODUCT_IDS = 40;

/**
 * Builds a /products "Fix now" link from an explicit set of affected
 * product ids (e.g. one catalog blocker's failing products). Above ~40 ids
 * this falls back to a plain filtered grid view rather than enumerating
 * every id in the URL.
 */
export function buildBlockerFixHref(productIds: string[]): string {
  if (productIds.length === 0 || productIds.length > MAX_LINKED_PRODUCT_IDS) {
    return "/products?view=grid";
  }
  return `/products?view=grid&ids=${productIds.map(encodeURIComponent).join(",")}`;
}

/** Builds a /products link scoped to one folder (category) -- used by the readiness-by-folder rollup. */
export function buildFolderFixHref(folderKey: string): string {
  return `/products?view=grid&folder=${encodeURIComponent(folderKey)}`;
}
