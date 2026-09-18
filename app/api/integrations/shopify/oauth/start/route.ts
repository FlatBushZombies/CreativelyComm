import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getMemberRole } from "@/lib/team";
import { isShopifyOAuthConfigured, buildShopifyAuthorizeUrl } from "@/lib/integrations/shopify";

const STATE_COOKIE = "shopify_oauth_state";

// Only these in-app destinations are honored after connecting (used when this
// flow is chained from "Continue with Shopify"); anything else falls back to Settings.
const ALLOWED_NEXT = new Set(["/onboarding", "/dashboard"]);

/**
 * Starts the real Shopify app-install OAuth handshake -- app/api/** isn't
 * touched by proxy.ts, so auth/role checks happen here manually, same
 * posture as every other route under app/api/**.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const role = await getMemberRole(workspace.id, session.user.id);
  if (role !== "owner" && role !== "admin") {
    return NextResponse.redirect(new URL("/settings?tab=integrations&shopify=error", request.url));
  }

  if (!isShopifyOAuthConfigured()) {
    return NextResponse.redirect(new URL("/settings?tab=integrations&shopify=error", request.url));
  }

  const shop = request.nextUrl.searchParams.get("shop")?.trim();
  if (!shop) {
    return NextResponse.redirect(new URL("/settings?tab=integrations&shopify=error", request.url));
  }

  const requestedNext = request.nextUrl.searchParams.get("next") ?? "";
  const next = ALLOWED_NEXT.has(requestedNext) ? requestedNext : "";

  const state = randomBytes(16).toString("hex");
  let authorizeUrl: string;
  try {
    authorizeUrl = buildShopifyAuthorizeUrl(shop, state);
  } catch {
    return NextResponse.redirect(new URL("/settings?tab=integrations&shopify=error", request.url));
  }
  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE, `${state}:${workspace.id}:${next}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
