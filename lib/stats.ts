import "server-only";
import { getProducts } from "@/lib/products";
import type { DashboardStat } from "@/lib/mock-data";

/**
 * Derives the dashboard stat cards from real product data instead of mock
 * numbers. No historical/event tracking exists yet, so `change` is left
 * blank rather than fabricating a trend — the UI hides the line when empty.
 */
export async function getDashboardStats(workspaceId: string): Promise<DashboardStat[]> {
  const products = await getProducts(workspaceId);

  const imagesOptimized = products.reduce((sum, p) => sum + p.optimizedImages.length, 0);
  const storeViews = products.reduce((sum, p) => sum + p.views, 0);
  const exportsTotal = products.reduce((sum, p) => sum + p.exports, 0);

  return [
    { label: "Total Products", value: String(products.length), change: "", trend: "neutral" },
    { label: "Images Optimized", value: String(imagesOptimized), change: "", trend: "neutral" },
    { label: "Store Views", value: storeViews.toLocaleString(), change: "", trend: "neutral" },
    { label: "Exports", value: String(exportsTotal), change: "", trend: "neutral" },
  ];
}
