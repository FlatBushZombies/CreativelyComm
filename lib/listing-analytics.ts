import type { Product } from "@/lib/products";

// "Motion for listings": which listing attributes go with selling, measured
// inside the merchant's OWN catalog. Pure (no I/O) so the grouping and the
// honesty guards can be checked against in-memory fixtures.
//
// This is correlation, not causation, and it says so in the UI. Shopify order
// data carries no traffic, so the outcome metric is sell-through (share of
// products with at least one sale), not views -> sales.

export const MIN_PRODUCTS_FOR_ANALYTICS = 10;
export const MIN_PRODUCTS_PER_GROUP = 3;

export interface AttributeGroup {
  label: string;
  products: number;
  /** Products in this group with at least one sold unit. */
  sold: number;
  /** sold / products, 0-100. */
  sellThroughPct: number;
  avgUnitsPerProduct: number;
  /** Average storefront views; null when no product in the catalog has any views yet. */
  avgViews: number | null;
}

export interface AttributeDimension {
  key: "images" | "description" | "tags" | "readiness" | "price";
  title: string;
  groups: AttributeGroup[];
}

export type ListingAnalytics =
  | { enoughData: false; reason: string; totalProducts: number }
  | {
      enoughData: true;
      totalProducts: number;
      /** Catalog-wide sell-through, the baseline every group is compared against. */
      overallSellThroughPct: number;
      dimensions: AttributeDimension[];
    };

interface Bucket {
  label: string;
  members: Product[];
}

function summarizeBucket(bucket: Bucket, unitsSoldByProduct: Map<string, number>, anyViews: boolean): AttributeGroup {
  const products = bucket.members.length;
  let sold = 0;
  let units = 0;
  let views = 0;
  for (const p of bucket.members) {
    const u = unitsSoldByProduct.get(p.id) ?? 0;
    if (u > 0) sold += 1;
    units += u;
    views += p.views;
  }
  return {
    label: bucket.label,
    products,
    sold,
    sellThroughPct: products === 0 ? 0 : Math.round((sold / products) * 100),
    avgUnitsPerProduct: products === 0 ? 0 : Math.round((units / products) * 10) / 10,
    avgViews: anyViews && products > 0 ? Math.round(views / products) : null,
  };
}

function bucketBy(products: Product[], labels: string[], pick: (p: Product) => number): Bucket[] {
  const buckets: Bucket[] = labels.map((label) => ({ label, members: [] }));
  for (const p of products) buckets[pick(p)].members.push(p);
  return buckets;
}

function priceBuckets(products: Product[]): Bucket[] {
  const sorted = [...products].sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
  const n = sorted.length;
  const thirds: Product[][] = [[], [], []];
  sorted.forEach((p, i) => thirds[Math.min(2, Math.floor((i * 3) / n))].push(p));
  const names = ["Lowest-priced third", "Middle third", "Highest-priced third"];
  return thirds.map((members, i) => {
    const range =
      members.length > 0
        ? ` ($${members[0].price.toFixed(0)}–$${members[members.length - 1].price.toFixed(0)})`
        : "";
    return { label: `${names[i]}${range}`, members };
  });
}

export function computeListingAnalytics(
  products: Product[],
  unitsSoldByProduct: Map<string, number>,
  readinessByProductId: Map<string, number>
): ListingAnalytics {
  const totalProducts = products.length;
  if (totalProducts < MIN_PRODUCTS_FOR_ANALYTICS) {
    return {
      enoughData: false,
      totalProducts,
      reason: `Needs at least ${MIN_PRODUCTS_FOR_ANALYTICS} products to compare listings fairly — you have ${totalProducts}.`,
    };
  }

  const totalSold = products.filter((p) => (unitsSoldByProduct.get(p.id) ?? 0) > 0).length;
  if (totalSold === 0) {
    return {
      enoughData: false,
      totalProducts,
      reason: "No products have sold yet, so there's nothing to compare. Connect Shopify orders or record sales to unlock this.",
    };
  }

  const anyViews = products.some((p) => p.views > 0);
  const score = (p: Product) => readinessByProductId.get(p.id) ?? 0;

  const candidates: { key: AttributeDimension["key"]; title: string; buckets: Bucket[] }[] = [
    {
      key: "images",
      title: "Photo count",
      buckets: bucketBy(products, ["1 photo or none", "2–3 photos", "4+ photos"], (p) =>
        p.images.length >= 4 ? 2 : p.images.length >= 2 ? 1 : 0
      ),
    },
    {
      key: "description",
      title: "Description length",
      buckets: bucketBy(products, ["Under 50 characters", "50–199 characters", "200+ characters"], (p) => {
        const len = p.description.trim().length;
        return len >= 200 ? 2 : len >= 50 ? 1 : 0;
      }),
    },
    {
      key: "tags",
      title: "Tags",
      buckets: bucketBy(products, ["No tags", "1–3 tags", "4+ tags"], (p) =>
        p.tags.length >= 4 ? 2 : p.tags.length >= 1 ? 1 : 0
      ),
    },
    {
      key: "readiness",
      title: "Readiness score",
      buckets: bucketBy(products, ["Under 50%", "50–79%", "80%+"], (p) => {
        const s = score(p);
        return s >= 80 ? 2 : s >= 50 ? 1 : 0;
      }),
    },
    { key: "price", title: "Price", buckets: priceBuckets(products) },
  ];

  const dimensions: AttributeDimension[] = [];
  for (const candidate of candidates) {
    // Groups too small to say anything are dropped rather than shown with noisy percentages.
    const groups = candidate.buckets
      .filter((b) => b.members.length >= MIN_PRODUCTS_PER_GROUP)
      .map((b) => summarizeBucket(b, unitsSoldByProduct, anyViews));
    // A comparison needs at least two groups to compare.
    if (groups.length >= 2) {
      dimensions.push({ key: candidate.key, title: candidate.title, groups });
    }
  }

  if (dimensions.length === 0) {
    return {
      enoughData: false,
      totalProducts,
      reason: "Your listings are too uniform to compare yet — each attribute needs at least two groups of 3+ products.",
    };
  }

  return {
    enoughData: true,
    totalProducts,
    overallSellThroughPct: Math.round((totalSold / totalProducts) * 100),
    dimensions,
  };
}
