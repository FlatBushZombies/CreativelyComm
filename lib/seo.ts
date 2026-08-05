import type { Product } from "@/lib/products";
import { slugify } from "@/lib/export/csv";

// Fixed SEO checklist -- deliberately not a configurable rule system like
// the channel readiness engine. Nothing here calls for per-workspace custom
// SEO rules, so a small fixed checklist is the honest, non-overbuilt fit.

export interface SeoCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface SeoScore {
  score: number;
  checks: SeoCheck[];
}

export function computeSeoScore(product: Product): SeoScore {
  const checks: SeoCheck[] = [
    {
      key: "meta_title",
      label: "Has a meta title",
      passed: Boolean(product.metaTitle && product.metaTitle.trim().length > 0),
    },
    {
      key: "meta_description",
      label: "Meta description is 50–160 characters",
      passed: Boolean(
        product.metaDescription &&
          product.metaDescription.trim().length >= 50 &&
          product.metaDescription.trim().length <= 160
      ),
    },
    {
      key: "slug",
      label: "Has a URL slug",
      passed: Boolean(product.slug && product.slug.trim().length > 0),
    },
    {
      key: "description_length",
      label: "Description is at least 100 characters",
      passed: product.description.trim().length >= 100,
    },
    {
      key: "has_image",
      label: "Has at least one image",
      passed: product.images.length > 0,
    },
    {
      key: "category",
      label: "Has a category",
      passed: product.category.trim().length > 0,
    },
  ];

  const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);
  return { score, checks };
}

export function generateSlug(name: string): string {
  return slugify(name);
}
