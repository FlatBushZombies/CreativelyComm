import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { notifySlack } from "@/lib/integrations/slack";
import { syncInventoryToShopify } from "@/lib/integrations/shopify";

export type StockAdjustmentReason = "restock" | "sale" | "correction" | "return" | "damaged";

export interface StockAdjustment {
  id: string;
  productId: string;
  delta: number;
  reason: StockAdjustmentReason;
  note: string | null;
  createdAt: string;
}

interface StockAdjustmentRow {
  id: string;
  product_id: string;
  delta: number;
  reason: StockAdjustmentReason;
  note: string | null;
  created_at: string;
}

export interface AdjustStockInput {
  delta: number;
  reason: StockAdjustmentReason;
  note?: string;
  createdBy?: string;
  orderId?: string;
  /** 'shopify' when this adjustment originated FROM an inbound Shopify webhook -- prevents echoing it straight back out. Defaults to 'local'. */
  source?: "local" | "shopify";
}

/**
 * Adjusts a product's stock_quantity and records the change in the
 * stock_adjustments audit ledger. When the resulting quantity crosses at or
 * below low_stock_threshold (coming down from above it), fires a real
 * in-app notification via the existing activity_log pipeline -- this is
 * the "automatic low-stock alert" half of order automation.
 */
export async function adjustStock(
  productId: string,
  workspaceId: string,
  input: AdjustStockInput
): Promise<number> {
  const supabase = getSupabaseServerClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("name, stock_quantity, low_stock_threshold")
    .eq("id", productId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (productError || !product) {
    throw new Error(`Failed to load product for stock adjustment: ${productError?.message ?? "not found"}`);
  }

  const previousQuantity = product.stock_quantity as number;
  const newQuantity = previousQuantity + input.delta;

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .eq("workspace_id", workspaceId);

  if (updateError) {
    throw new Error(`Failed to update stock: ${updateError.message}`);
  }

  const { error: ledgerError } = await supabase.from("stock_adjustments").insert({
    product_id: productId,
    workspace_id: workspaceId,
    order_id: input.orderId ?? null,
    delta: input.delta,
    reason: input.reason,
    note: input.note ?? null,
    created_by: input.createdBy ?? null,
  });

  if (ledgerError) {
    throw new Error(`Failed to record stock adjustment: ${ledgerError.message}`);
  }

  const threshold = product.low_stock_threshold as number;
  const crossedIntoLowStock = previousQuantity > threshold && newQuantity <= threshold;
  if (crossedIntoLowStock) {
    await logActivity(workspaceId, {
      type: "low_stock",
      title: "Low stock",
      description: `${product.name} is down to ${newQuantity} unit${newQuantity === 1 ? "" : "s"}.`,
      productName: product.name as string,
    });
    await notifySlack(workspaceId, `:warning: *${product.name}* is down to ${newQuantity} unit${newQuantity === 1 ? "" : "s"}.`);
  }

  // Loop guard: only push outbound when this change didn't originate FROM
  // Shopify itself, otherwise an inbound webhook would echo straight back out.
  if (input.source !== "shopify") {
    await syncInventoryToShopify(workspaceId, { productId, quantity: newQuantity });
  }

  return newQuantity;
}

export async function getStockHistory(productId: string, workspaceId: string): Promise<StockAdjustment[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("stock_adjustments")
    .select("id, product_id, delta, reason, note, created_at")
    .eq("product_id", productId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load stock history: ${error.message}`);
  }

  return (data as StockAdjustmentRow[]).map((row) => ({
    id: row.id,
    productId: row.product_id,
    delta: row.delta,
    reason: row.reason,
    note: row.note,
    createdAt: row.created_at,
  }));
}

export interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
}

export async function getLowStockProducts(workspaceId: string): Promise<LowStockProduct[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, stock_quantity, low_stock_threshold")
    .eq("workspace_id", workspaceId)
    .eq("track_inventory", true)
    .order("stock_quantity", { ascending: true });

  if (error) {
    throw new Error(`Failed to load low stock products: ${error.message}`);
  }

  return (data ?? [])
    .filter((row) => row.stock_quantity <= row.low_stock_threshold)
    .map((row) => ({
      id: row.id,
      name: row.name,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
    }));
}
