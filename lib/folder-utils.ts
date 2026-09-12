import type { LucideIcon } from "lucide-react";
import {
  Folder,
  Shirt,
  Gem,
  Utensils,
  Sofa,
  Smartphone,
  BookOpen,
  Dumbbell,
  Sparkles,
  Baby,
  PawPrint,
  Palette,
  Wrench,
  Candy,
  Flower2,
} from "lucide-react";
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
  icon: LucideIcon;
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

/**
 * Stable string keys, resolved to an actual icon component only through the
 * FOLDER_ICON_COMPONENTS lookup table below -- so call sites (including
 * inside JSX) always read an icon via plain object indexing rather than
 * invoking a function that returns a component.
 */
export const FOLDER_ICON_COMPONENTS = {
  default: Folder,
  shirt: Shirt,
  gem: Gem,
  utensils: Utensils,
  sofa: Sofa,
  smartphone: Smartphone,
  book: BookOpen,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  baby: Baby,
  pet: PawPrint,
  art: Palette,
  tool: Wrench,
  candy: Candy,
  garden: Flower2,
} satisfies Record<string, LucideIcon>;

type FolderIconKey = keyof typeof FOLDER_ICON_COMPONENTS;

/**
 * Keyword -> icon-key rules for common product categories, checked against
 * the folder's name. Falls back to "default" for anything that doesn't
 * match -- this is a fixed lookup table, not a guess, so a folder either
 * clearly matches one of these or gets the honest default.
 */
const CATEGORY_ICON_RULES: { keywords: string[]; iconKey: FolderIconKey }[] = [
  { keywords: ["shirt", "apparel", "clothing", "wear", "fashion", "hoodie", "jacket", "dress"], iconKey: "shirt" },
  { keywords: ["jewelry", "jewellery", "ring", "necklace", "earring", "bracelet"], iconKey: "gem" },
  { keywords: ["food", "snack", "kitchen", "coffee", "tea", "spice", "sauce"], iconKey: "utensils" },
  { keywords: ["furniture", "sofa", "chair", "table", "home", "decor"], iconKey: "sofa" },
  { keywords: ["electronic", "gadget", "tech", "phone", "device", "charger"], iconKey: "smartphone" },
  { keywords: ["book", "stationery", "paper", "journal", "notebook"], iconKey: "book" },
  { keywords: ["fitness", "sport", "gym", "yoga", "outdoor"], iconKey: "dumbbell" },
  { keywords: ["beauty", "skincare", "cosmetic", "makeup", "fragrance"], iconKey: "sparkles" },
  { keywords: ["baby", "kid", "toy", "child", "nursery"], iconKey: "baby" },
  { keywords: ["pet", "dog", "cat", "animal"], iconKey: "pet" },
  { keywords: ["art", "craft", "print", "paint", "illustration"], iconKey: "art" },
  { keywords: ["tool", "hardware", "garage", "diy"], iconKey: "tool" },
  { keywords: ["candle", "sweet", "candy", "chocolate"], iconKey: "candy" },
  { keywords: ["garden", "plant", "flower", "bouquet"], iconKey: "garden" },
];

/** Resolves a folder's category name to a stable icon-lookup key -- see FOLDER_ICON_COMPONENTS. */
export function folderIconKey(key: string): FolderIconKey {
  if (key === UNCATEGORIZED_KEY) return "default";
  const lower = key.toLowerCase();
  for (const rule of CATEGORY_ICON_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) return rule.iconKey;
  }
  return "default";
}

/** Picks a distinctive icon for a folder based on its category name, falling back to a generic Folder icon. */
export function iconForFolder(key: string): LucideIcon {
  return FOLDER_ICON_COMPONENTS[folderIconKey(key)];
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
      icon: FOLDER_ICON_COMPONENTS[folderIconKey(key)],
    };
  });

  return folders.sort((a, b) => {
    if (a.key === UNCATEGORIZED_KEY) return 1;
    if (b.key === UNCATEGORIZED_KEY) return -1;
    return b.count - a.count;
  });
}

export interface FolderSuggestion {
  productId: string;
  suggestedCategory: string;
  matchedTag: string;
}

/**
 * Suggests a category for each uncategorized product by finding which
 * existing category its tags appear in most often among already-categorized
 * products. Deterministic and grounded in the workspace's own real tags --
 * never a guessed/fabricated category, and a product with no tag overlap
 * simply gets no suggestion (stays Uncategorized) rather than a forced one.
 */
export function suggestCategoriesForUncategorized(products: Product[]): FolderSuggestion[] {
  const categorized = products.filter((p) => p.category.trim());
  const uncategorized = products.filter((p) => !p.category.trim());
  if (categorized.length === 0 || uncategorized.length === 0) return [];

  const tagToCategoryCounts = new Map<string, Map<string, number>>();
  for (const product of categorized) {
    const category = product.category.trim();
    for (const tag of product.tags) {
      const tagKey = tag.toLowerCase();
      const counts = tagToCategoryCounts.get(tagKey) ?? new Map<string, number>();
      counts.set(category, (counts.get(category) ?? 0) + 1);
      tagToCategoryCounts.set(tagKey, counts);
    }
  }

  const suggestions: FolderSuggestion[] = [];
  for (const product of uncategorized) {
    let bestCategory: string | null = null;
    let bestCount = 0;
    let bestTag = "";
    for (const tag of product.tags) {
      const counts = tagToCategoryCounts.get(tag.toLowerCase());
      if (!counts) continue;
      for (const [category, count] of counts) {
        if (count > bestCount) {
          bestCount = count;
          bestCategory = category;
          bestTag = tag;
        }
      }
    }
    if (bestCategory) {
      suggestions.push({ productId: product.id, suggestedCategory: bestCategory, matchedTag: bestTag });
    }
  }
  return suggestions;
}
