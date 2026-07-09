import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";

export interface ProductVersion {
  id: string;
  changeSummary: string;
  snapshot: Product;
  createdAt: string;
}

interface ProductVersionRow {
  id: string;
  change_summary: string;
  snapshot: Product;
  created_at: string;
}

/** Fire-and-forget style — a missing version snapshot shouldn't fail the caller's mutation. */
export async function recordProductVersion(
  workspaceId: string,
  product: Product,
  changeSummary: string
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("product_versions").insert({
    product_id: product.id,
    workspace_id: workspaceId,
    change_summary: changeSummary,
    snapshot: product,
  });

  if (error) {
    console.error("Failed to record product version:", error.message);
  }
}

export async function getProductVersions(
  productId: string,
  workspaceId: string
): Promise<ProductVersion[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_versions")
    .select("*")
    .eq("product_id", productId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load product versions: ${error.message}`);
  }

  return (data as ProductVersionRow[]).map((row) => ({
    id: row.id,
    changeSummary: row.change_summary,
    snapshot: row.snapshot,
    createdAt: row.created_at,
  }));
}
