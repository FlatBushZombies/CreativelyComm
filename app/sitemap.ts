import type { MetadataRoute } from "next";
import { getAllPublishedProductsForSitemap } from "@/lib/sitemap";

// Computed per-request rather than baked in at build time: a sitemap
// reflecting live published products would go stale between deploys
// otherwise, and statically prerendering it makes every build depend on
// Supabase being reachable during the build step itself.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const entries = await getAllPublishedProductsForSitemap();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "weekly", priority: 1 },
  ];

  const productEntries: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${origin}/store/${entry.workspaceSlug}/products/${entry.productId}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
