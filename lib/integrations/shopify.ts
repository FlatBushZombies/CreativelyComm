import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getIntegration, upsertIntegration, disconnectIntegration, markIntegrationError } from "@/lib/integrations/store";
import type { Product } from "@/lib/products";

const API_VERSION = "2026-07";

// Scopes the app actually uses: shop.json/locations.json (read_locations),
// products.json (read/write_products), inventory_levels (read/write_inventory) --
// see connectShopify, syncProductToShopify, syncInventoryToShopify below.
const OAUTH_SCOPES = "read_products,write_products,read_inventory,write_inventory,read_locations";

const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;

/**
 * Normalizes user input ("My-Store", "https://my-store.myshopify.com/") to a
 * bare `my-store.myshopify.com`, or null if it isn't a real myshopify.com
 * store domain. The strict check matters: this value ends up in redirect
 * URLs and in server-side fetches that carry our client secret, so anything
 * like "evil.com/x" must never get through.
 */
export function normalizeShopDomain(input: string): string | null {
  const trimmed = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const candidate = trimmed.endsWith(".myshopify.com") ? trimmed : `${trimmed}.myshopify.com`;
  return SHOP_DOMAIN_PATTERN.test(candidate) ? candidate : null;
}

function requireShopDomain(input: string): string {
  const domain = normalizeShopDomain(input);
  if (!domain) {
    throw new Error("Enter a valid store domain like my-store.myshopify.com.");
  }
  return domain;
}

function adminUrl(shopDomain: string, path: string): string {
  return `https://${shopDomain}/admin/api/${API_VERSION}/${path}`;
}

/** True once a real Shopify Partner app (Client ID/secret) exists -- checked by the settings page before showing the OAuth "Connect" button. */
export function isShopifyOAuthConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_APP_CLIENT_ID && process.env.SHOPIFY_APP_CLIENT_SECRET);
}

export interface AuthorizeUrlOptions {
  /** Path (on this app) Shopify redirects back to. Defaults to the integration-connect callback. */
  redirectPath?: string;
  /** Per-user "online" token -- identifies the staff member approving (used for sign-in). Default is the offline token the integration needs. */
  online?: boolean;
}

/** Builds the URL to redirect a merchant to for the app-install OAuth handshake. */
export function buildShopifyAuthorizeUrl(
  shopDomainInput: string,
  state: string,
  options: AuthorizeUrlOptions = {}
): string {
  const shopDomain = requireShopDomain(shopDomainInput);
  const clientId = process.env.SHOPIFY_APP_CLIENT_ID as string;
  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const redirectUri = `${origin}${options.redirectPath ?? "/api/integrations/shopify/oauth/callback"}`;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: OAUTH_SCOPES,
    redirect_uri: redirectUri,
    state,
  });
  if (options.online) {
    params.append("grant_options[]", "per-user");
  }
  return `https://${shopDomain}/admin/oauth/authorize?${params.toString()}`;
}

/**
 * Verifies Shopify's OAuth callback query string against the app's own
 * Client Secret, per Shopify's documented scheme: every param except `hmac`,
 * sorted by key, joined as `key=value&...`, HMAC-SHA256'd. Same timing-safe
 * comparison as verifyShopifyWebhookHmac below, just a different string to sign.
 */
export function verifyShopifyOAuthCallback(searchParams: URLSearchParams): boolean {
  const clientSecret = process.env.SHOPIFY_APP_CLIENT_SECRET;
  const hmac = searchParams.get("hmac");
  if (!clientSecret || !hmac) return false;

  const pairs: string[] = [];
  for (const [key, value] of searchParams.entries()) {
    if (key === "hmac") continue;
    pairs.push(`${key}=${value}`);
  }
  pairs.sort();
  const message = pairs.join("&");

  const computed = createHmac("sha256", clientSecret).update(message, "utf8").digest("hex");
  const a = Buffer.from(computed);
  const b = Buffer.from(hmac);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The staff member who approved an online (per-user) authorization. Per Shopify, trust `email` only when `email_verified` is true. */
export interface ShopifyAssociatedUser {
  id: number;
  email?: string;
  email_verified?: boolean;
  first_name?: string;
  last_name?: string;
  account_owner?: boolean;
}

/** Exchanges an OAuth authorization code; online-mode responses also carry the approving staff member. */
export async function exchangeShopifyOAuthCodeDetailed(
  shopDomainInput: string,
  code: string
): Promise<{ accessToken: string; associatedUser?: ShopifyAssociatedUser }> {
  const shopDomain = requireShopDomain(shopDomainInput);
  const res = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_APP_CLIENT_ID,
      client_secret: process.env.SHOPIFY_APP_CLIENT_SECRET,
      code,
    }),
  });

  if (!res.ok) {
    throw new Error(`Shopify rejected the OAuth code exchange (${res.status}).`);
  }

  const body = (await res.json()) as { access_token?: string; associated_user?: ShopifyAssociatedUser };
  if (!body.access_token) {
    throw new Error("Shopify's OAuth response didn't include an access token.");
  }
  return { accessToken: body.access_token, associatedUser: body.associated_user };
}

/** Exchanges an OAuth authorization code for a real (offline) Admin API access token. */
export async function exchangeShopifyOAuthCode(shopDomainInput: string, code: string): Promise<string> {
  return (await exchangeShopifyOAuthCodeDetailed(shopDomainInput, code)).accessToken;
}

export interface ConnectShopifyInput {
  shopDomain: string;
  accessToken: string;
  apiSecret: string;
}

/**
 * Verifies the workspace's own custom-app access token against their store,
 * grabs the primary fulfillment location (needed for inventory pushes), and
 * registers real webhooks so changes made directly in Shopify flow back
 * into CreativelyComm without polling.
 */
export async function connectShopify(workspaceId: string, input: ConnectShopifyInput): Promise<void> {
  const shopDomain = requireShopDomain(input.shopDomain);
  const headers = { "X-Shopify-Access-Token": input.accessToken, "Content-Type": "application/json" };

  const shopRes = await fetch(adminUrl(shopDomain, "shop.json"), { headers });
  if (!shopRes.ok) {
    throw new Error(`Shopify rejected that access token (${shopRes.status}). Check the token and shop domain.`);
  }

  const locationsRes = await fetch(adminUrl(shopDomain, "locations.json"), { headers });
  if (!locationsRes.ok) {
    throw new Error(`Could not read locations from Shopify (${locationsRes.status}).`);
  }
  const { locations } = (await locationsRes.json()) as { locations: { id: number }[] };
  const locationId = locations[0]?.id;
  if (!locationId) {
    throw new Error("This Shopify store has no fulfillment location to sync inventory against.");
  }

  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const webhookAddress = `${origin}/api/webhooks/shopify`;
  const webhookIds: number[] = [];

  for (const topic of ["products/update", "inventory_levels/update"]) {
    const res = await fetch(adminUrl(shopDomain, "webhooks.json"), {
      method: "POST",
      headers,
      body: JSON.stringify({ webhook: { topic, address: webhookAddress, format: "json" } }),
    });
    if (res.ok) {
      const { webhook } = (await res.json()) as { webhook: { id: number } };
      webhookIds.push(webhook.id);
    }
  }

  await upsertIntegration(workspaceId, "shopify", {
    status: "connected",
    credentials: { accessToken: input.accessToken, apiSecret: input.apiSecret },
    config: { locationId, webhookIds },
    shopifyShopDomain: shopDomain,
  });
}

export async function disconnectShopify(workspaceId: string): Promise<void> {
  const integration = await getIntegration(workspaceId, "shopify");
  if (integration?.status === "connected" && integration.shopifyShopDomain) {
    const headers = { "X-Shopify-Access-Token": integration.credentials.accessToken as string };
    const webhookIds = (integration.config.webhookIds as number[] | undefined) ?? [];
    await Promise.allSettled(
      webhookIds.map((id) =>
        fetch(adminUrl(integration.shopifyShopDomain!, `webhooks/${id}.json`), { method: "DELETE", headers })
      )
    );
  }
  await disconnectIntegration(workspaceId, "shopify");
}

export interface ShopifyLinkage {
  shopifyProductId: string | null;
  shopifyVariantId: string | null;
}

export interface SyncOptions {
  /** Send the full image set. Off for plain text/price edits (Shopify re-downloads every image on each PUT), on for creates, new photos, and "Sync all". */
  includeImages?: boolean;
  /** Also push the current stock level. Always on for a first push; on for "Sync all". */
  includeInventory?: boolean;
}

export interface SyncResult {
  ok: boolean;
  /** True when Shopify simply isn't connected -- not a failure. */
  skipped?: boolean;
  error?: string;
}

/**
 * Pure: builds the Shopify product body for a create (no linkage) or update.
 * - Images: optimized first, then originals, deduped -- the whole set, not
 *   just the first photo.
 * - Status: only `published` products go `active`. A new product otherwise
 *   lands as a Shopify `draft`, so an unfinished listing never goes live on
 *   the storefront by accident. Updates never demote an already-live listing.
 * - Variant: keeps the existing variant id on update (without it Shopify
 *   treats the variant as new).
 */
export function buildShopifyProductPayload(
  product: Product,
  linkage: ShopifyLinkage,
  options: SyncOptions = {}
): { product: Record<string, unknown> } {
  const isUpdate = Boolean(linkage.shopifyProductId);

  const variant: Record<string, unknown> = { sku: product.sku, price: product.price.toFixed(2) };
  if (linkage.shopifyVariantId) variant.id = Number(linkage.shopifyVariantId);
  if (!isUpdate && product.trackInventory) variant.inventory_management = "shopify";

  const body: Record<string, unknown> = {
    title: product.name,
    body_html: product.description,
    product_type: product.category,
    tags: product.tags.join(", "),
    variants: [variant],
  };

  if (options.includeImages || !isUpdate) {
    const sources = Array.from(new Set([...product.optimizedImages, ...product.images].filter(Boolean)));
    body.images = sources.map((src) => ({ src }));
  }

  if (product.status === "published") {
    body.status = "active";
  } else if (!isUpdate) {
    body.status = "draft";
  }

  return { product: body };
}

/** One bounded retry on Shopify's REST rate limit (HTTP 429), honoring Retry-After. */
async function shopifyFetch(url: string, init: RequestInit): Promise<Response> {
  const res = await fetch(url, init);
  if (res.status !== 429) return res;
  const retryAfter = Math.min(Number(res.headers.get("retry-after")) || 2, 10);
  await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
  return fetch(url, init);
}

async function recordSyncOutcome(productId: string, error: string | null): Promise<void> {
  const supabase = getSupabaseServerClient();
  await supabase
    .from("products")
    .update({
      shopify_synced_at: error ? undefined : new Date().toISOString(),
      shopify_sync_error: error,
    })
    .eq("id", productId);
}

/** Only a rejected token means the whole integration is broken; a single bad product must not disable sync for every other one. */
async function handleFailedResponse(workspaceId: string, productId: string, name: string, status: number, detail: string) {
  const message = `Shopify rejected "${name}" (${status})${detail ? `: ${detail}` : ""}.`;
  await recordSyncOutcome(productId, message);
  if (status === 401 || status === 403) {
    await markIntegrationError(workspaceId, "shopify", "Shopify rejected our access token -- reconnect the store.");
  }
  return message;
}

async function readErrorDetail(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { errors?: unknown };
    if (typeof body.errors === "string") return body.errors;
    if (body.errors) return JSON.stringify(body.errors).slice(0, 200);
  } catch {
    // non-JSON error body -- the status code alone is what we have
  }
  return "";
}

/**
 * Pushes a product create/update to the workspace's own Shopify store and
 * records per-product sync status on the product row. Never throws --
 * awaited by its caller but error-isolated, same contract as
 * notifySlack/logActivity, so a Shopify outage never fails the product save
 * that triggered it.
 */
export async function syncProductToShopify(
  workspaceId: string,
  product: Product,
  options: SyncOptions = {}
): Promise<SyncResult> {
  try {
    const integration = await getIntegration(workspaceId, "shopify");
    if (!integration || integration.status !== "connected" || !integration.shopifyShopDomain) {
      return { ok: true, skipped: true };
    }

    const shopDomain = integration.shopifyShopDomain;
    const headers = {
      "X-Shopify-Access-Token": integration.credentials.accessToken as string,
      "Content-Type": "application/json",
    };
    const supabase = getSupabaseServerClient();

    const { data: linkage } = await supabase
      .from("products")
      .select("shopify_product_id, shopify_variant_id")
      .eq("id", product.id)
      .maybeSingle();

    const existingId = (linkage?.shopify_product_id as string | null | undefined) ?? null;
    const payload = buildShopifyProductPayload(
      product,
      { shopifyProductId: existingId, shopifyVariantId: (linkage?.shopify_variant_id as string | null | undefined) ?? null },
      options
    );

    const res = existingId
      ? await shopifyFetch(adminUrl(shopDomain, `products/${existingId}.json`), {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        })
      : await shopifyFetch(adminUrl(shopDomain, "products.json"), {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const error = await handleFailedResponse(workspaceId, product.id, product.name, res.status, await readErrorDetail(res));
      return { ok: false, error };
    }

    const { product: shopifyProduct } = (await res.json()) as {
      product: { id: number; variants: { id: number; inventory_item_id: number }[] };
    };
    const variant = shopifyProduct.variants[0];

    await supabase
      .from("products")
      .update({
        shopify_product_id: String(shopifyProduct.id),
        shopify_variant_id: variant ? String(variant.id) : null,
        shopify_inventory_item_id: variant ? String(variant.inventory_item_id) : null,
      })
      .eq("id", product.id);

    if ((options.includeInventory || !existingId) && product.trackInventory && variant) {
      await pushInventoryLevel(integration.credentials.accessToken as string, shopDomain, integration.config.locationId, variant.inventory_item_id, product.stockQuantity);
    }

    await recordSyncOutcome(product.id, null);
    return { ok: true };
  } catch (err) {
    console.error("Failed to sync product to Shopify:", err);
    const error = err instanceof Error ? err.message : "Unexpected error while syncing to Shopify.";
    await recordSyncOutcome(product.id, error).catch(() => undefined);
    return { ok: false, error };
  }
}

export interface BulkSyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Full "sync every listing now" -- sequential with a short pause, since
 * Shopify's REST bucket refills at roughly 2 requests/second. Sends the
 * complete image set and current stock for each product.
 */
export async function syncProductsToShopify(workspaceId: string, products: Product[]): Promise<BulkSyncResult> {
  const result: BulkSyncResult = { synced: 0, failed: 0, errors: [] };

  for (const product of products) {
    const outcome = await syncProductToShopify(workspaceId, product, { includeImages: true, includeInventory: true });
    if (outcome.skipped) break;
    if (outcome.ok) {
      result.synced += 1;
    } else {
      result.failed += 1;
      if (outcome.error && result.errors.length < 5) result.errors.push(outcome.error);
    }
    await new Promise((resolve) => setTimeout(resolve, 550));
  }

  return result;
}

export interface ShopifySyncSummary {
  total: number;
  synced: number;
  failed: number;
  lastError: string | null;
}

/** Catalog-wide sync counts for the integration card. */
export async function getShopifySyncSummary(workspaceId: string): Promise<ShopifySyncSummary> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("shopify_product_id, shopify_sync_error")
    .eq("workspace_id", workspaceId);

  const rows = (data ?? []) as { shopify_product_id: string | null; shopify_sync_error: string | null }[];
  const failed = rows.filter((r) => r.shopify_sync_error);
  return {
    total: rows.length,
    synced: rows.filter((r) => r.shopify_product_id && !r.shopify_sync_error).length,
    failed: failed.length,
    lastError: failed[0]?.shopify_sync_error ?? null,
  };
}

async function pushInventoryLevel(
  accessToken: string,
  shopDomain: string,
  locationId: unknown,
  inventoryItemId: number | string,
  quantity: number
): Promise<Response> {
  return shopifyFetch(adminUrl(shopDomain, "inventory_levels/set.json"), {
    method: "POST",
    headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
    body: JSON.stringify({ location_id: locationId, inventory_item_id: Number(inventoryItemId), available: quantity }),
  });
}

/**
 * Pushes a stock-quantity change to Shopify's InventoryLevels API. No-op if
 * the product was never linked to Shopify (never synced, or synced before
 * a variant existed). Same error-isolated, non-throwing contract.
 */
export async function syncInventoryToShopify(
  workspaceId: string,
  params: { productId: string; quantity: number }
): Promise<void> {
  try {
    const integration = await getIntegration(workspaceId, "shopify");
    if (!integration || integration.status !== "connected" || !integration.shopifyShopDomain) return;

    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("products")
      .select("shopify_inventory_item_id")
      .eq("id", params.productId)
      .maybeSingle();

    const inventoryItemId = data?.shopify_inventory_item_id as string | null | undefined;
    if (!inventoryItemId) return;

    const res = await pushInventoryLevel(
      integration.credentials.accessToken as string,
      integration.shopifyShopDomain,
      integration.config.locationId,
      inventoryItemId,
      params.quantity
    );

    if (res.status === 401 || res.status === 403) {
      await markIntegrationError(workspaceId, "shopify", "Shopify rejected our access token -- reconnect the store.");
    }
  } catch (err) {
    console.error("Failed to sync inventory to Shopify:", err);
  }
}

/** Timing-safe HMAC verification for inbound Shopify webhooks. */
export function verifyShopifyWebhookHmac(rawBody: string, hmacHeader: string | null, apiSecret: string): boolean {
  if (!hmacHeader) return false;
  const computed = createHmac("sha256", apiSecret).update(rawBody, "utf8").digest("base64");
  const a = Buffer.from(computed);
  const b = Buffer.from(hmacHeader);
  return a.length === b.length && timingSafeEqual(a, b);
}
