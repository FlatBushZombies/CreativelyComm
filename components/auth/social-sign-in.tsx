"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { SiGoogle, SiShopify } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/auth-client";

interface SocialSignInProps {
  googleConfigured: boolean;
  shopifyConfigured: boolean;
  /** Where a brand-new or returning user lands afterwards -- /onboarding from signup, /dashboard from login. */
  destination: "/onboarding" | "/dashboard";
  /** Google's post-auth redirect (login honors ?redirect=). */
  googleCallbackURL?: string;
}

/**
 * "Continue with Google" / "Continue with Shopify". Both always render so the
 * options are discoverable, but each is disabled (with a plain note) until the
 * matching credentials exist -- never a button that silently fails.
 */
export function SocialSignIn({ googleConfigured, shopifyConfigured, destination, googleCallbackURL }: SocialSignInProps) {
  const [shopifyOpen, setShopifyOpen] = useState(false);
  const [shopDomain, setShopDomain] = useState("");

  function handleGoogle() {
    posthog.capture("google_auth_started", { destination });
    authClient.signIn.social({ provider: "google", callbackURL: googleCallbackURL ?? destination });
  }

  function handleShopify(e: React.FormEvent) {
    e.preventDefault();
    const shop = shopDomain.trim();
    if (!shop) return;
    posthog.capture("shopify_auth_started", { destination });
    // A plain full-page navigation: this is an OAuth redirect, not a fetch.
    window.location.href = `/api/auth/shopify/sign-in/start?shop=${encodeURIComponent(shop)}&next=${encodeURIComponent(destination)}`;
  }

  const notSetUp = [!googleConfigured && "Google", !shopifyConfigured && "Shopify"].filter(Boolean) as string[];

  return (
    <>
      <div className="space-y-2">
        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={!googleConfigured}>
          <SiGoogle className="h-4 w-4" />
          Continue with Google
        </Button>

        {shopifyOpen && shopifyConfigured ? (
          <form onSubmit={handleShopify} className="space-y-2 rounded-lg border border-border p-3">
            <label htmlFor="shopify-domain" className="text-xs font-medium text-muted-foreground">
              Your Shopify store
            </label>
            <Input
              id="shopify-domain"
              autoFocus
              placeholder="my-store.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={!shopDomain.trim()}>
                <SiShopify className="h-4 w-4" />
                Continue with Shopify
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShopifyOpen(false)}>
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll sign you in with the verified email on your Shopify staff account and connect this store so your products can sync.
            </p>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShopifyOpen(true)}
            disabled={!shopifyConfigured}
          >
            <SiShopify className="h-4 w-4" />
            Continue with Shopify
          </Button>
        )}

        {notSetUp.length > 0 && (
          <p className="text-center text-xs text-muted-foreground">
            {notSetUp.join(" and ")} sign-in {notSetUp.length > 1 ? "aren't" : "isn't"} set up yet.
          </p>
        )}
      </div>

      <div className="my-4 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>
    </>
  );
}
