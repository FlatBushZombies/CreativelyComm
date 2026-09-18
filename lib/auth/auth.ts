import "server-only";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { shopifySignIn } from "@/lib/auth/shopify-sign-in";
import { isShopifyOAuthConfigured } from "@/lib/integrations/shopify";

/** True once real Google OAuth credentials exist -- checked here and by the login/signup pages before enabling the button. */
export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** True once a real Shopify Partner app exists -- "Continue with Shopify" uses the same app credentials as the store integration. */
export function isShopifyAuthConfigured(): boolean {
  return isShopifyOAuthConfigured();
}

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  // Inert (redirects to /login with an error) until SHOPIFY_APP_CLIENT_ID/SECRET exist.
  plugins: [shopifySignIn()],
  // OAuth failures (Google, Shopify, account-not-linked, ...) redirect to the
  // login page as ?error=<code>, which shows a readable message, instead of
  // Better Auth's bare built-in error page.
  onAPIError: { errorURL: "/login" },
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  // Only registers the "google" provider when real credentials exist, so an
  // unconfigured deploy can't produce a broken Google OAuth redirect --
  // isGoogleAuthConfigured() is what actually hides the button.
  socialProviders: isGoogleAuthConfigured()
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : undefined,
  // scripts/sql/001_better_auth_core.sql uses snake_case columns (to match the
  // rest of this project's schema) instead of Better Auth's camelCase defaults.
  // These `fields` maps point Better Auth's internal camelCase model names at
  // the actual snake_case columns instead of renaming the columns themselves.
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  session: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      userId: "user_id",
    },
  },
  account: {
    fields: {
      accountId: "account_id",
      providerId: "provider_id",
      userId: "user_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
});
