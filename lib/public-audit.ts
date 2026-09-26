import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";
import {
  computeReadiness,
  getDefaultChannelsWithRules,
  type Channel,
  type ChannelRule,
  type RuleResult,
} from "@/lib/readiness";
import { computeAutoFix } from "@/lib/readiness-autofix";
import { fetchPublicText, GuardedFetchError, normalizePublicDomain } from "@/lib/net-guard";

// Free "audit your store" funnel. Scores a public Shopify storefront's
// /products.json against the DEFAULT channel rules only. Everything scored
// comes from fields that public feed actually exposes (title, description,
// price, first-variant SKU, images, tags, product type); nothing is guessed.

const AUDIT_PRODUCT_LIMIT = 250;
const READY_THRESHOLD = 80;
const RATE_LIMIT_PER_IP_PER_HOUR = 5;
const RATE_LIMIT_GLOBAL_PER_HOUR = 300;
const REUSE_WINDOW_MS = 24 * 60 * 60 * 1000;
const TOP_BLOCKERS = 6;
const WORST_PRODUCTS = 5;

export interface AuditChannelScore {
  channel: string;
  score: number;
}

export interface AuditBlocker {
  channel: string;
  ruleKey: string;
  rule: string;
  failCount: number;
  failRate: number;
  advice: string;
}

export interface PublicAudit {
  id: string;
  domain: string;
  productCount: number;
  readyCount: number;
  avgScore: number;
  /** Distinct (product, rule) failures, and how many of those the one-click auto-fix can clear. */
  issuesTotal: number;
  issuesFixable: number;
  channelScores: AuditChannelScore[];
  topBlockers: AuditBlocker[];
  worstProducts: { title: string; score: number }[];
  createdAt: string;
}

export type AuditResult = { ok: true; id: string } | { ok: false; error: string };

const ADVICE: Record<string, string> = {
  sku_present: "Give every product a SKU. Marketplaces and inventory tools use it as the product identifier.",
  price_positive: "Make sure every product has a price above zero.",
  min_images: "Add more product photos. Some channels, like Amazon, expect three or more.",
  description_min_length: "Write fuller descriptions. Thin descriptions hurt search and get flagged on several channels.",
  tags_present: "Add search tags. Etsy and TikTok Shop lean on them for discovery.",
  category_set: "Set a product type / category. Google Merchant and Facebook Catalog need it.",
};

// -- Mapping the public feed ------------------------------------------------

interface PublicFeedProduct {
  id?: number | string;
  title?: string;
  body_html?: string | null;
  product_type?: string | null;
  tags?: string[] | string | null;
  variants?: { sku?: string | null; price?: string | number | null }[];
  images?: { src?: string | null }[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Pure: Shopify /products.json entries -> the Product shape the readiness engine scores. */
export function mapPublicFeedProducts(feed: PublicFeedProduct[]): Product[] {
  return feed.map((p, index) => {
    const variant = p.variants?.[0];
    const tags = Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === "string"
        ? p.tags.split(",")
        : [];
    const price = Number(variant?.price ?? 0);
    return {
      id: String(p.id ?? index),
      name: String(p.title ?? "Untitled"),
      description: stripHtml(String(p.body_html ?? "")),
      price: Number.isFinite(price) ? price : 0,
      category: String(p.product_type ?? "").trim(),
      status: "published",
      images: (p.images ?? []).map((i) => i.src ?? "").filter(Boolean),
      optimizedImages: [],
      sku: String(variant?.sku ?? "").trim(),
      tags: tags.map((t) => String(t).trim()).filter(Boolean),
      createdAt: "",
      updatedAt: "",
      views: 0,
      exports: 0,
      vendorId: null,
      trackInventory: false,
      stockQuantity: 0,
      lowStockThreshold: 0,
      metaTitle: null,
      metaDescription: null,
      slug: null,
      shopifyProductId: null,
      shopifySyncedAt: null,
      shopifySyncError: null,
      shopifyHeldReason: null,
    };
  });
}

// -- Scoring ----------------------------------------------------------------

export type AuditScore = Omit<PublicAudit, "id" | "domain" | "createdAt">;

/** Pure scoring against an already-loaded rule set (so it can be unit-tested without a database). */
export function scoreAudit(products: Product[], channelsWithRules: { channel: Channel; rules: ChannelRule[] }[]): AuditScore {
  const scoresByChannel = new Map<string, number[]>();
  const blockers = new Map<string, AuditBlocker>();
  const perProduct: { product: Product; averageScore: number }[] = [];
  let issuesTotal = 0;
  let issuesFixable = 0;

  for (const product of products) {
    const failedAll: RuleResult[] = [];
    const scores: number[] = [];
    for (const { channel, rules } of channelsWithRules) {
      const { score, failed } = computeReadiness(product, rules);
      scores.push(score);
      scoresByChannel.set(channel.name, [...(scoresByChannel.get(channel.name) ?? []), score]);
      failedAll.push(...failed);
      for (const rule of failed) {
        const key = `${channel.id}:${rule.key}`;
        const existing = blockers.get(key);
        if (existing) existing.failCount += 1;
        else
          blockers.set(key, {
            channel: channel.name,
            ruleKey: rule.key,
            rule: rule.label,
            failCount: 1,
            failRate: 0,
            advice: ADVICE[rule.key] ?? "Fill this in on the affected products.",
          });
      }
    }

    perProduct.push({
      product,
      averageScore: scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0,
    });

    issuesTotal += new Set(failedAll.map((r) => r.key)).size;
    issuesFixable += computeAutoFix(product, failedAll, products).fixed.length;
  }

  const avgScore = perProduct.length ? Math.round(perProduct.reduce((s, p) => s + p.averageScore, 0) / perProduct.length) : 0;

  return {
    productCount: products.length,
    readyCount: perProduct.filter((p) => p.averageScore >= READY_THRESHOLD).length,
    avgScore,
    issuesTotal,
    issuesFixable,
    channelScores: channelsWithRules.map(({ channel }) => {
      const scores = scoresByChannel.get(channel.name) ?? [];
      return { channel: channel.name, score: scores.length ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : 0 };
    }),
    topBlockers: Array.from(blockers.values())
      .map((b) => ({ ...b, failRate: products.length ? b.failCount / products.length : 0 }))
      .sort((a, b) => b.failCount - a.failCount)
      .slice(0, TOP_BLOCKERS),
    worstProducts: perProduct
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, WORST_PRODUCTS)
      .map((p) => ({ title: p.product.name, score: p.averageScore })),
  };
}

// -- Persistence + orchestration ---------------------------------------------

interface AuditRow {
  id: string;
  domain: string;
  product_count: number;
  ready_count: number;
  avg_score: number;
  issues_total: number;
  issues_fixable: number;
  channel_scores: AuditChannelScore[];
  top_blockers: AuditBlocker[];
  worst_products: { title: string; score: number }[];
  created_at: string;
}

function mapAuditRow(row: AuditRow): PublicAudit {
  return {
    id: row.id,
    domain: row.domain,
    productCount: row.product_count,
    readyCount: row.ready_count,
    avgScore: row.avg_score,
    issuesTotal: row.issues_total,
    issuesFixable: row.issues_fixable,
    channelScores: row.channel_scores ?? [],
    topBlockers: row.top_blockers ?? [],
    worstProducts: row.worst_products ?? [],
    createdAt: row.created_at,
  };
}

export async function getPublicAudit(id: string): Promise<PublicAudit | null> {
  if (!/^[A-Za-z0-9_-]{6,32}$/.test(id)) return null;
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("public_audits").select("*").eq("id", id).maybeSingle();
  return data ? mapAuditRow(data as AuditRow) : null;
}

function hashIp(ip: string): string {
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "public-audit").update(ip).digest("hex");
}

async function fetchPublicProducts(domain: string): Promise<Product[]> {
  const noFeed = new GuardedFetchError(
    "This store doesn't expose a public product feed, so we can't audit it from the outside. Only Shopify stores with /products.json enabled work. Sign up to audit any catalog by connecting it directly."
  );

  let response;
  try {
    response = await fetchPublicText(domain, `/products.json?limit=${AUDIT_PRODUCT_LIMIT}`);
  } catch (err) {
    if (err instanceof GuardedFetchError) throw err;
    throw new GuardedFetchError("Couldn't reach that store.");
  }
  if (response.status !== 200) throw noFeed;

  let parsed: { products?: PublicFeedProduct[] };
  try {
    parsed = JSON.parse(response.body);
  } catch {
    throw noFeed;
  }
  if (!Array.isArray(parsed.products)) throw noFeed;
  if (parsed.products.length === 0) {
    throw new GuardedFetchError("That store's public feed has no products to audit.");
  }
  return mapPublicFeedProducts(parsed.products);
}

/**
 * Runs (or reuses) an audit for a store. Abuse controls without Redis: a
 * database-backed per-IP and global hourly limit, plus reuse of any audit of
 * the same domain from the last 24h (no outbound fetch, and a stable share URL).
 */
export async function runPublicAudit(rawDomain: string, clientIp: string): Promise<AuditResult> {
  const normalized = normalizePublicDomain(rawDomain);
  if (!normalized.ok) return { ok: false, error: normalized.error };
  const { domain } = normalized;

  const supabase = getSupabaseServerClient();

  const { data: recent } = await supabase
    .from("public_audits")
    .select("id")
    .eq("domain", domain)
    .gte("created_at", new Date(Date.now() - REUSE_WINDOW_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent) return { ok: true, id: recent.id as string };

  const ipHash = hashIp(clientIp);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [perIp, global] = await Promise.all([
    supabase.from("public_audits").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", hourAgo),
    supabase.from("public_audits").select("id", { count: "exact", head: true }).gte("created_at", hourAgo),
  ]);
  if ((perIp.count ?? 0) >= RATE_LIMIT_PER_IP_PER_HOUR) {
    return { ok: false, error: "You've run a few audits already. Please try again in about an hour." };
  }
  if ((global.count ?? 0) >= RATE_LIMIT_GLOBAL_PER_HOUR) {
    return { ok: false, error: "The audit is very busy right now. Please try again in a bit." };
  }

  let products: Product[];
  try {
    products = await fetchPublicProducts(domain);
  } catch (err) {
    return { ok: false, error: err instanceof GuardedFetchError ? err.message : "Couldn't audit that store." };
  }

  const score = scoreAudit(products, await getDefaultChannelsWithRules());
  const id = randomBytes(8).toString("base64url");
  const { error } = await supabase.from("public_audits").insert({
    id,
    domain,
    product_count: score.productCount,
    ready_count: score.readyCount,
    avg_score: score.avgScore,
    issues_total: score.issuesTotal,
    issues_fixable: score.issuesFixable,
    channel_scores: score.channelScores,
    top_blockers: score.topBlockers,
    worst_products: score.worstProducts,
    ip_hash: ipHash,
  });
  if (error) {
    console.error("Failed to save public audit:", error.message);
    return { ok: false, error: "Something went wrong saving your audit. Please try again." };
  }
  return { ok: true, id };
}
