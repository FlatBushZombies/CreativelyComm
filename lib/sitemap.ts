import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface SitemapEntry {
  workspaceSlug: string;
  productId: string;
  updatedAt: string;
}

interface SitemapRow {
  id: string;
  updated_at: string;
  workspaces: { slug: string } | null;
}

/**
 * The one deliberately cross-tenant query in this codebase: every other
 * lib/ function is scoped to a single workspaceId, but a sitemap has to
 * enumerate published products across every workspace. Built explicitly
 * rather than reusing getProducts in a loop (which is workspace-scoped by
 * design and would require calling it once per workspace).
 */
export async function getAllPublishedProductsForSitemap(): Promise<SitemapEntry[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, updated_at, workspaces(slug)")
    .in("status", ["optimized", "published"]);

  if (error) {
    throw new Error(`Failed to load products for sitemap: ${error.message}`);
  }

  return (data as unknown as SitemapRow[])
    .filter((row) => row.workspaces !== null)
    .map((row) => ({
      workspaceSlug: row.workspaces!.slug,
      productId: row.id,
      updatedAt: row.updated_at,
    }));
}
