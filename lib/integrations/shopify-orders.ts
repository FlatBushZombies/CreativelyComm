import "server-only";
import { getIntegration } from "@/lib/integrations/store";
import { upsertExternalOrder, type ExternalOrderInput, type OrderStatus } from "@/lib/orders";

const API_VERSION = "2026-07";

/** The subset of a Shopify order payload (webhook or REST) that Product Intelligence uses. */
export interface ShopifyOrderPayload {
  id: number | string;
  created_at?: string;
  cancelled_at?: string | null;
  financial_status?: string | null;
  fulfillment_status?: string | null;
  total_price?: string | number | null;
  subtotal_price?: string | number | null;
  email?: string | null;
  contact_email?: string | null;
  note?: string | null;
  customer?: { first_name?: string | null; last_name?: string | null } | null;
  line_items?: {
    product_id?: number | string | null;
    title?: string | null;
    name?: string | null;
    sku?: string | null;
    price?: string | number | null;
    quantity?: number | null;
  }[];
}

function toNumber(value: string | number | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Cancelled/voided orders stay excluded from "sold" (see SOLD_STATUSES in lib/intelligence.ts). */
export function mapShopifyOrderStatus(payload: Pick<ShopifyOrderPayload, "cancelled_at" | "financial_status" | "fulfillment_status">): OrderStatus {
  if (payload.cancelled_at) return "cancelled";
  const financial = payload.financial_status ?? "";
  if (financial === "voided") return "cancelled";
  if (financial === "refunded") return "refunded";
  if (payload.fulfillment_status === "fulfilled") return "fulfilled";
  if (financial === "paid" || financial === "partially_paid" || financial === "partially_refunded") return "paid";
  return "open";
}

/** Pure: Shopify order JSON -> our mirrored-order shape. */
export function mapShopifyOrder(payload: ShopifyOrderPayload): ExternalOrderInput {
  const customerName = [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(" ").trim();
  return {
    externalId: String(payload.id),
    status: mapShopifyOrderStatus(payload),
    customerName: customerName || null,
    customerEmail: payload.email ?? payload.contact_email ?? null,
    subtotal: toNumber(payload.subtotal_price),
    total: toNumber(payload.total_price),
    note: payload.note ?? null,
    createdAt: payload.created_at ?? new Date().toISOString(),
    items: (payload.line_items ?? []).map((line) => ({
      externalProductId: line.product_id != null ? String(line.product_id) : null,
      productName: line.title ?? line.name ?? "Item",
      sku: line.sku || null,
      unitPrice: toNumber(line.price),
      quantity: Math.max(1, Number(line.quantity ?? 1)),
    })),
  };
}

export interface BackfillResult {
  imported: number;
  /** Set when Shopify refused (typically the read_orders scope wasn't granted) -- not a crash, just no history. */
  error?: string;
}

const MAX_PAGES = 8;
const BACKFILL_DAYS = 60; // Shopify's default order window without the read_all_orders scope

/**
 * Pulls recent order history once at connect time so Product Intelligence has
 * something to work with immediately. Sequential paging (Shopify REST rate
 * limit). Never throws.
 */
export async function backfillShopifyOrders(workspaceId: string): Promise<BackfillResult> {
  try {
    const integration = await getIntegration(workspaceId, "shopify");
    if (!integration || integration.status !== "connected" || !integration.shopifyShopDomain) {
      return { imported: 0, error: "Shopify isn't connected." };
    }

    const headers = { "X-Shopify-Access-Token": integration.credentials.accessToken as string };
    const since = new Date(Date.now() - BACKFILL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    let url: string | null =
      `https://${integration.shopifyShopDomain}/admin/api/${API_VERSION}/orders.json?status=any&limit=250&created_at_min=${encodeURIComponent(since)}`;
    let imported = 0;

    for (let page = 0; page < MAX_PAGES && url; page++) {
      const res: Response = await fetch(url, { headers });
      if (res.status === 401 || res.status === 403) {
        return { imported, error: "Shopify didn't grant order access (read_orders). Reconnect to enable order sync." };
      }
      if (!res.ok) {
        return { imported, error: `Shopify returned ${res.status} while reading orders.` };
      }

      const { orders } = (await res.json()) as { orders: ShopifyOrderPayload[] };
      for (const order of orders) {
        await upsertExternalOrder(workspaceId, "shopify", mapShopifyOrder(order));
        imported += 1;
      }

      const next = /<([^>]+)>;\s*rel="next"/.exec(res.headers.get("link") ?? "");
      url = next ? next[1] : null;
      if (url) await new Promise((resolve) => setTimeout(resolve, 550));
    }

    return { imported };
  } catch (err) {
    console.error("Failed to backfill Shopify orders:", err);
    return { imported: 0, error: err instanceof Error ? err.message : "Unexpected error reading orders." };
  }
}
