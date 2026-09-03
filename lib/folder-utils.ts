import type { Product } from "@/lib/products";

export const UNCATEGORIZED_KEY = "Uncategorized";

export interface ProductFolder {
  /** The raw category value (matches Product.category exactly), or UNCATEGORIZED_KEY for products with no category set. */
  key: string;
  name: string;
  count: number;
  thumbnails: string[];
  tags: string[];
  gradient: { from: string; to: string };
}

/**
 * On-brand accent palette for folder cards -- muted, earthy tones that sit
 * alongside the site's forest-green/cream theme (--primary #386641,
 * --secondary #f2f1ea) instead of the saturated blue/orange-pink of a
 * generic reference design. Each category hashes to a stable entry so the
 * same folder always gets the same color across renders.
 */
const FOLDER_PALETTE: { from: string; to: string }[] = [
  { from: "#386641", to: "#5b8a66" }, // forest green (brand primary)
  { from: "#a85a34", to: "#d68a56" }, // clay / terracotta
  { from: "#2f6b66", to: "#4f9c92" }, // deep teal
  { from: "#a9822f", to: "#d4ac5c" }, // amber / gold
  { from: "#6b4a63", to: "#9a6f8f" }, // plum
  { from: "#45566b", to: "#71879e" }, // slate blue
];

const UNCATEGORIZED_GRADIENT = { from: "#6b6a5f", to: "#8f8d7e" }; // muted olive-gray

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function colorForFolder(key: string): { from: string; to: string } {
  if (key === UNCATEGORIZED_KEY) return UNCATEGORIZED_GRADIENT;
  return FOLDER_PALETTE[hashString(key) % FOLDER_PALETTE.length];
}

/** Groups products by their category into folder summaries, most-populated first (Uncategorized always last). */
export function groupProductsIntoFolders(products: Product[]): ProductFolder[] {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const key = product.category.trim() || UNCATEGORIZED_KEY;
    const existing = groups.get(key);
    if (existing) {
      existing.push(product);
    } else {
      groups.set(key, [product]);
    }
  }

  const folders: ProductFolder[] = Array.from(groups.entries()).map(([key, items]) => {
    const tagCounts = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tag]) => tag);

    return {
      key,
      name: key,
      count: items.length,
      thumbnails: items.slice(0, 3).map((p) => p.optimizedImages[0] ?? p.images[0]).filter((src): src is string => Boolean(src)),
      tags: topTags,
      gradient: colorForFolder(key),
    };
  });

  return folders.sort((a, b) => {
    if (a.key === UNCATEGORIZED_KEY) return 1;
    if (b.key === UNCATEGORIZED_KEY) return -1;
    return b.count - a.count;
  });
}
