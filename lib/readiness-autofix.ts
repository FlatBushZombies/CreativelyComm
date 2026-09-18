import type { Product, UpdateProductInput } from "@/lib/products";
import type { RuleResult } from "@/lib/readiness";
import { suggestCategoriesForUncategorized } from "@/lib/folder-utils";

// Auto-fix for Channel Readiness failures -- deterministic, built only from
// the product's own real data (or the catalog's, for category inference).
// Two rule keys are deliberately NEVER auto-fixed: price and images are the
// merchant's actual business data, not something software can honestly
// invent on their behalf.

export interface FixedIssue {
  ruleKey: string;
  label: string;
}

export interface UnresolvableIssue {
  ruleKey: string;
  label: string;
  reason: string;
}

export interface AutoFixResult {
  patch: UpdateProductInput;
  fixed: FixedIssue[];
  unresolvable: UnresolvableIssue[];
}

const STOPWORDS = new Set(["the", "a", "an", "and", "or", "for", "with", "of", "in", "on", "to"]);

function deriveTags(product: Product): string[] {
  const words = `${product.name} ${product.category}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

  const unique: string[] = [];
  for (const word of words) {
    if (!unique.includes(word)) unique.push(word);
    if (unique.length >= 5) break;
  }
  return unique;
}

function generateSku(product: Product): string {
  const prefix = (product.name.replace(/[^a-zA-Z]/g, "").slice(0, 3) || "SKU").toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

function generateDescription(product: Product, minLength: number): string {
  const tags = product.tags.length > 0 ? product.tags : deriveTags(product);
  const category = product.category.trim();

  let description = `"${product.name}"`;
  description += category ? ` is part of our ${category} collection` : " is available in our catalog";
  if (tags.length > 0) description += `, featuring ${tags.slice(0, 4).join(", ")}`;
  description += `. Priced at $${product.price.toFixed(2)}`;
  if (product.sku) description += ` (SKU ${product.sku})`;
  description += ". Add more detail here to make this listing stand out even more.";

  if (description.length < minLength) {
    description += " " + "This listing is ready to customize further with your own photos, story, and details.";
  }
  return description;
}

const RULE_LABELS: Record<string, string> = {
  sku_present: "Add a SKU",
  price_positive: "Set a price",
  min_images: "Add product photos",
  description_min_length: "Write a longer description",
  category_set: "Set a category",
  tags_present: "Add search tags",
};

/**
 * Computes one patch that clears every auto-fixable failure across every
 * channel for this product in a single pass -- e.g. if Shopify wants a
 * 20-character description and Amazon wants 100, the generated description
 * is long enough for both, not just the loosest requirement.
 */
export function computeAutoFix(
  product: Product,
  failedRules: RuleResult[],
  catalogProducts: Product[]
): AutoFixResult {
  const patch: UpdateProductInput = {};
  const fixed: FixedIssue[] = [];
  const unresolvable: UnresolvableIssue[] = [];
  const seenKeys = new Set<string>();

  // Group by rule key so a rule failing on 3 channels only gets handled once,
  // but with the strictest `min` among all of them.
  const byKey = new Map<string, RuleResult[]>();
  for (const rule of failedRules) {
    const list = byKey.get(rule.key) ?? [];
    list.push(rule);
    byKey.set(rule.key, list);
  }

  for (const [key, rules] of byKey) {
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    const label = rules[0].label || RULE_LABELS[key] || key;

    switch (key) {
      case "sku_present": {
        patch.sku = generateSku(product);
        fixed.push({ ruleKey: key, label });
        break;
      }
      case "tags_present": {
        const tags = deriveTags(product);
        if (tags.length > 0) {
          patch.tags = tags;
          fixed.push({ ruleKey: key, label });
        } else {
          unresolvable.push({ ruleKey: key, label, reason: "This product's name doesn't have enough words to derive tags from — add some yourself." });
        }
        break;
      }
      case "category_set": {
        const suggestions = suggestCategoriesForUncategorized(catalogProducts);
        const match = suggestions.find((s) => s.productId === product.id);
        if (match) {
          patch.category = match.suggestedCategory;
          fixed.push({ ruleKey: key, label });
        } else {
          unresolvable.push({ ruleKey: key, label, reason: "No similar categorized products to match against — pick a category yourself." });
        }
        break;
      }
      case "description_min_length": {
        const minRequired = Math.max(...rules.map((r) => Number(r.config.min ?? 1)));
        if (product.description.trim().length < minRequired) {
          patch.description = generateDescription(product, minRequired);
          fixed.push({ ruleKey: key, label });
        }
        break;
      }
      case "price_positive": {
        unresolvable.push({ ruleKey: key, label, reason: "You'll need to set a real price — we can't guess your pricing." });
        break;
      }
      case "min_images": {
        const min = Math.max(...rules.map((r) => Number(r.config.min ?? 1)));
        unresolvable.push({
          ruleKey: key,
          label,
          reason: `Add at least ${min} real product photo${min === 1 ? "" : "s"} — we can't generate real photos for you.`,
        });
        break;
      }
      default: {
        unresolvable.push({ ruleKey: key, label, reason: "This needs a manual edit." });
      }
    }
  }

  return { patch, fixed, unresolvable };
}
