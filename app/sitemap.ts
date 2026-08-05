import type { MetadataRoute } from "next";
import { getAllPublishedProductsForSitemap } from "@/lib/sitemap";

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
