import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getIntegration, upsertIntegration, disconnectIntegration, markIntegrationError } from "@/lib/integrations/store";

const API_VERSION = "2026-07";

// Scopes the app actually uses: shop.json/locations.json (read_locations),
// products.json (read/write_products), inventory_levels (read/write_inventory) --
// see connectShopify, syncProductToShopify, syncInventoryToShopify below.
const OAUTH_SCOPES = "read_products,write_products,read_inventory,write_inventory,read_locations";

function normalizeShopDomain(input: string): string {
  const trimmed = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return trimmed.endsWith(".myshopify.com") ? trimmed : `${trimmed}.myshopify.com`;
}

function adminUrl(shopDomain: string, path: string): string {
  return `https://${shopDomain}/admin/api/${API_VERSION}/${path}`;
}

/** True once a real Shopify Partner app (Client ID/secret) exists -- checked by the settings page before showing the OAuth "Connect" button. */
export function isShopifyOAuthConfigured(): boolean {
  return Boolean(process.env.SHOPIFY_APP_CLIENT_ID && process.env.SHOPIFY_APP_CLIENT_SECRET);
}

/** Builds the URL to redirect a merchant to for the app-install OAuth handshake. */
export function buildShopifyAuthorizeUrl(shopDomainInput: string, state: string): string {
  const shopDomain = normalizeShopDomain(shopDomainInput);
  const clientId = process.env.SHOPIFY_APP_CLIENT_ID as string;
  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const redirectUri = `${origin}/api/integrations/shopify/oauth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: OAUTH_SCOPES,
    redirect_uri: redirectUri,
    state,
  });
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

/** Exchanges an OAuth authorization code for a real Admin API access token. */
export async function exchangeShopifyOAuthCode(shopDomainInput: string, code: string): Promise<string> {
  const shopDomain = normalizeShopDomain(shopDomainInput);
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

  const { access_token: accessToken } = (await res.json()) as { access_token?: string };
  if (!accessToken) {
    throw new Error("Shopify's OAuth response didn't include an access token.");
  }
  return accessToken;
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
  const shopDomain = normalizeShopDomain(input.shopDomain);
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

export interface ShopifyProductFields {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  imageUrl: string | null;
}

/**
 * Pushes a product create/update to the workspace's own Shopify store.
 * Never throws -- awaited by its caller but error-isolated, same contract
 * as notifySlack/logActivity, so a Shopify outage never fails the product
 * save that triggered it.
 */
export async function syncProductToShopify(workspaceId: string, product: ShopifyProductFields): Promise<void> {
  try {
    const integration = await getIntegration(workspaceId, "shopify");
    if (!integration || integration.status !== "connected" || !integration.shopifyShopDomain) return;

    const headers = {
      "X-Shopify-Access-Token": integration.credentials.accessToken as string,
      "Content-Type": "application/json",
    };
    const supabase = getSupabaseServerClient();

    const { data: linkage } = await supabase
      .from("products")
      .select("shopify_product_id, shopify_variant_id, shopify_inventory_item_id")
      .eq("id", product.id)
      .maybeSingle();

    const payload = {
      product: {
        title: product.name,
        body_html: product.description,
        product_type: product.category,
        variants: [{ sku: product.sku, price: product.price.toFixed(2) }],
        images: product.imageUrl ? [{ src: product.imageUrl }] : [],
      },
    };

    const existingId = linkage?.shopify_product_id as string | null | undefined;
    const res = existingId
      ? await fetch(adminUrl(integration.shopifyShopDomain, `products/${existingId}.json`), {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        })
      : await fetch(adminUrl(integration.shopifyShopDomain, "products.json"), {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      await markIntegrationError(workspaceId, "shopify", `Failed to sync "${product.name}" (${res.status}).`);
      return;
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
  } catch (err) {
    console.error("Failed to sync product to Shopify:", err);
  }
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

    const locationId = integration.config.locationId;
    const res = await fetch(adminUrl(integration.shopifyShopDomain, "inventory_levels/set.json"), {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": integration.credentials.accessToken as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location_id: locationId,
        inventory_item_id: Number(inventoryItemId),
        available: params.quantity,
      }),
    });

    if (!res.ok) {
      await markIntegrationError(workspaceId, "shopify", `Failed to sync stock (${res.status}).`);
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
