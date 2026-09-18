import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logActivity } from "@/lib/activity";
import {
  verifyShopifyOAuthCallback,
  exchangeShopifyOAuthCode,
  connectShopify,
} from "@/lib/integrations/shopify";

const STATE_COOKIE = "shopify_oauth_state";
const ALLOWED_NEXT = new Set(["/onboarding", "/dashboard"]);

function errorRedirect(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/settings?tab=integrations&shopify=error", request.url));
  response.cookies.delete(STATE_COOKIE);
  return response;
}

/**
 * Completes the Shopify OAuth handshake. No session check needed beyond the
 * state cookie -- it's set only for the workspace that started the flow
 * (shopify/oauth/start/route.ts), so it doubles as both CSRF protection and
 * "which workspace is this for."
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!shop || !code || !state || !verifyShopifyOAuthCallback(searchParams)) {
    return errorRedirect(request);
  }

  const stateCookie = request.cookies.get(STATE_COOKIE)?.value;
  const [expectedState, workspaceId, storedNext] = stateCookie?.split(":") ?? [];
  if (!expectedState || expectedState !== state || !workspaceId) {
    return errorRedirect(request);
  }

  try {
    const accessToken = await exchangeShopifyOAuthCode(shop, code);
    await connectShopify(workspaceId, {
      shopDomain: shop,
      accessToken,
      apiSecret: process.env.SHOPIFY_APP_CLIENT_SECRET as string,
    });
  } catch {
    return errorRedirect(request);
  }

  await logActivity(workspaceId, {
    type: "integration",
    title: "Shopify connected",
    description: `Connected to ${shop} via OAuth.`,
  });

  // Chained from "Continue with Shopify": land where a fresh sign-in would (onboarding for new accounts).
  const destination = ALLOWED_NEXT.has(storedNext ?? "")
    ? `${storedNext}?shopify=connected`
    : "/settings?tab=integrations&shopify=connected";
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.cookies.delete(STATE_COOKIE);
  return response;
}
