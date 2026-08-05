import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getIntegrationByShopDomain, markIntegrationSynced } from "@/lib/integrations/store";
import { verifyShopifyWebhookHmac } from "@/lib/integrations/shopify";
import { adjustStock } from "@/lib/inventory";

/**
 * Inbound Shopify webhooks (products/update, inventory_levels/update). No
 * session check here -- app/api/** isn't touched by proxy.ts, and the HMAC
 * signature (verified against the workspace's own Shopify API secret) IS
 * the auth, same posture as lib/api-auth.ts's inbound API key check.
 *
 * Always processes with source: 'shopify' so these inbound changes never
 * echo back out to Shopify via lib/products.ts / lib/inventory.ts's
 * outbound sync hooks -- see the loop-guard note in those files.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const shopDomain = request.headers.get("x-shopify-shop-domain");
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");

  if (!shopDomain) {
    return NextResponse.json({ error: "Missing shop domain" }, { status: 400 });
  }

  const integration = await getIntegrationByShopDomain(shopDomain);
  if (!integration || integration.status !== "connected") {
    return NextResponse.json({ error: "Unknown shop" }, { status: 404 });
  }

  const apiSecret = integration.credentials.apiSecret as string | undefined;
  if (!apiSecret || !verifyShopifyWebhookHmac(rawBody, hmacHeader, apiSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const supabase = getSupabaseServerClient();

  if (topic === "products/update") {
    const shopifyProductId = String(payload.id);
    const variant = payload.variants?.[0];
    await supabase
      .from("products")
      .update({
        name: payload.title,
        description: payload.body_html ?? "",
        price: variant ? Number(variant.price) : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("shopify_product_id", shopifyProductId);
  } else if (topic === "inventory_levels/update") {
    const inventoryItemId = String(payload.inventory_item_id);
    const { data: product } = await supabase
      .from("products")
      .select("id, workspace_id, stock_quantity")
      .eq("shopify_inventory_item_id", inventoryItemId)
      .maybeSingle();

    if (product) {
      const delta = Number(payload.available) - product.stock_quantity;
      if (delta !== 0) {
        await adjustStock(product.id, product.workspace_id, {
          delta,
          reason: "correction",
          note: "Synced from Shopify",
          source: "shopify",
        });
      }
    }
  }

  await markIntegrationSynced(integration.workspaceId, "shopify");
  return NextResponse.json({ ok: true });
}
