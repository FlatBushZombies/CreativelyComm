/**
 * Platform format specifications, kept as code config rather than scattered
 * through components (or a DB table, since these are static app config, not
 * user data). Add a platform here and every content-pack UI picks it up.
 */
export type PlatformCategory = "social" | "ads" | "website";

export interface PlatformSpec {
  id: string;
  label: string;
  category: PlatformCategory;
  width: number;
  height: number;
  description: string;
}

export const PLATFORM_SPECS: PlatformSpec[] = [
  { id: "instagram-square", label: "Instagram — Square", category: "social", width: 1080, height: 1080, description: "Feed post, 1:1" },
  { id: "instagram-portrait", label: "Instagram — Portrait", category: "social", width: 1080, height: 1350, description: "Feed post, 4:5" },
  { id: "instagram-story", label: "Instagram — Story/Reel", category: "social", width: 1080, height: 1920, description: "Full-screen, 9:16" },
  { id: "facebook-feed", label: "Facebook — Feed", category: "social", width: 1080, height: 1080, description: "Feed post, 1:1" },
  { id: "pinterest-pin", label: "Pinterest — Pin", category: "social", width: 1000, height: 1500, description: "Standard vertical pin, 2:3" },
  { id: "website-square", label: "Website — Product square", category: "website", width: 1200, height: 1200, description: "Product page thumbnail/gallery" },
  { id: "website-landscape", label: "Website — Hero/banner", category: "website", width: 1600, height: 1000, description: "Landscape hero or banner" },
  { id: "ad-square", label: "Ad — Square", category: "ads", width: 1080, height: 1080, description: "1:1 ad placement" },
  { id: "ad-portrait", label: "Ad — Portrait", category: "ads", width: 1080, height: 1350, description: "4:5 ad placement" },
  { id: "ad-landscape", label: "Ad — Landscape", category: "ads", width: 1200, height: 628, description: "Link/display ad, 1.91:1" },
];

export function getPlatformSpec(id: string): PlatformSpec | undefined {
  return PLATFORM_SPECS.find((p) => p.id === id);
}

export const PLATFORM_CATEGORY_LABELS: Record<PlatformCategory, string> = {
  social: "Social",
  ads: "Advertising",
  website: "Website",
};
