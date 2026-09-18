import "server-only";
import { randomBytes } from "crypto";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { handleOAuthUserInfo } from "better-auth/oauth2";
import {
  isShopifyOAuthConfigured,
  normalizeShopDomain,
  buildShopifyAuthorizeUrl,
  verifyShopifyOAuthCallback,
  exchangeShopifyOAuthCodeDetailed,
} from "@/lib/integrations/shopify";

const STATE_COOKIE = "shopify_signin_state";
const CALLBACK_PATH = "/api/auth/shopify/sign-in/callback";

/** Only these in-app destinations are honored -- `next` is user-controlled, so never redirect to an arbitrary path/host. */
const ALLOWED_NEXT = new Set(["/onboarding", "/dashboard"]);

function appUrl(path: string): string {
  return new URL(path, process.env.BETTER_AUTH_URL || "http://localhost:3000").toString();
}

function loginError(code: string): string {
  return appUrl(`/login?error=${encodeURIComponent(code)}`);
}

/**
 * "Continue with Shopify" -- a real sign-in, built on Shopify's per-user
 * ("online") OAuth. Shopify has no generic identity provider, but an online
 * authorization returns the staff member who approved it (`associated_user`),
 * and Shopify documents that its `email` is only trustworthy when
 * `email_verified` is true -- so that's the gate here. We deliberately do NOT
 * identify people by the shop's contact email: any staff member with app-install
 * rights would otherwise sign in as the store owner.
 *
 * Modeled on Better Auth's own Google One Tap plugin: user/account/session
 * creation and its account-linking safety rules all go through
 * handleOAuthUserInfo, not hand-rolled session code. After signing in we
 * chain into the existing offline-token flow (/api/integrations/shopify/oauth)
 * because online tokens expire in 24h and can't power ongoing product sync.
 */
export const shopifySignIn = () =>
  ({
    id: "shopify-sign-in",
    endpoints: {
      shopifySignInStart: createAuthEndpoint("/shopify/sign-in/start", { method: "GET" }, async (ctx) => {
        const query = new URL(ctx.request?.url ?? appUrl("/")).searchParams;
        const shop = normalizeShopDomain(query.get("shop") ?? "");
        const requestedNext = query.get("next") ?? "";
        const next = ALLOWED_NEXT.has(requestedNext) ? requestedNext : "/dashboard";

        if (!isShopifyOAuthConfigured()) throw ctx.redirect(loginError("shopify_not_configured"));
        if (!shop) throw ctx.redirect(loginError("shopify_invalid_shop"));

        const state = randomBytes(16).toString("hex");
        ctx.setCookie(STATE_COOKIE, `${state}:${next}`, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 600,
          path: "/",
        });

        throw ctx.redirect(buildShopifyAuthorizeUrl(shop, state, { online: true, redirectPath: CALLBACK_PATH }));
      }),

      shopifySignInCallback: createAuthEndpoint("/shopify/sign-in/callback", { method: "GET" }, async (ctx) => {
        const params = new URL(ctx.request?.url ?? appUrl("/")).searchParams;
        const shop = params.get("shop");
        const code = params.get("code");
        const state = params.get("state");

        const clearState = () =>
          ctx.setCookie(STATE_COOKIE, "", { httpOnly: true, maxAge: 0, path: "/", sameSite: "lax" });

        const cookie = ctx.getCookie(STATE_COOKIE);
        const [expectedState, storedNext] = cookie?.split(":") ?? [];
        clearState();

        const normalizedShop = shop ? normalizeShopDomain(shop) : null;
        if (
          !normalizedShop ||
          !code ||
          !state ||
          !verifyShopifyOAuthCallback(params) ||
          !expectedState ||
          expectedState !== state
        ) {
          throw ctx.redirect(loginError("shopify_failed"));
        }

        let associatedUser;
        try {
          associatedUser = (await exchangeShopifyOAuthCodeDetailed(normalizedShop, code)).associatedUser;
        } catch {
          throw ctx.redirect(loginError("shopify_failed"));
        }

        if (!associatedUser?.email || associatedUser.email_verified !== true) {
          throw ctx.redirect(loginError("shopify_email_unverified"));
        }

        const fullName = [associatedUser.first_name, associatedUser.last_name].filter(Boolean).join(" ").trim();
        const result = await handleOAuthUserInfo(ctx, {
          userInfo: {
            id: String(associatedUser.id),
            email: associatedUser.email.toLowerCase(),
            emailVerified: true,
            name: fullName || associatedUser.email.split("@")[0],
          },
          account: {
            providerId: "shopify",
            accountId: String(associatedUser.id),
            scope: "online",
          },
        });

        if (result.error || !result.data) {
          throw ctx.redirect(loginError((result.error ?? "shopify_failed").split(" ").join("_")));
        }

        await setSessionCookie(ctx, result.data);

        // Signed in. Now obtain the long-lived (offline) token for the store connection.
        const next = ALLOWED_NEXT.has(storedNext ?? "") ? (storedNext as string) : "/dashboard";
        throw ctx.redirect(
          appUrl(`/api/integrations/shopify/oauth/start?shop=${encodeURIComponent(normalizedShop)}&next=${encodeURIComponent(next)}`)
        );
      }),
    },
  }) satisfies BetterAuthPlugin;
