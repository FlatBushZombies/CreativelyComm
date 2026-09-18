"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialSignIn } from "@/components/auth/social-sign-in";
import { Logo } from "@/components/shared/logo";
import { authClient } from "@/lib/auth/auth-client";

interface LoginClientProps {
  googleConfigured: boolean;
  shopifyConfigured: boolean;
}

// Every OAuth failure (Google, Shopify, Better Auth's own) lands here as ?error=<code>.
const ERROR_MESSAGES: Record<string, string> = {
  shopify_not_configured: "Shopify sign-in isn't set up yet.",
  shopify_invalid_shop: "Enter a valid store domain like my-store.myshopify.com.",
  shopify_failed: "Shopify sign-in didn't complete. Please try again.",
  shopify_email_unverified:
    "Shopify didn't return a verified email for your staff account, so we can't sign you in with it.",
  account_not_linked:
    "An account with this email already exists. Sign in with the method you originally used (for example your password).",
  signup_disabled: "Sign-ups are disabled.",
};

function describeError(code: string | null): string | null {
  if (!code) return null;
  return ERROR_MESSAGES[code] ?? "Sign-in didn't complete. Please try again.";
}

export function LoginClient(props: LoginClientProps) {
  return (
    <Suspense fallback={null}>
      <LoginForm {...props} />
    </Suspense>
  );
}

function LoginForm({ googleConfigured, shopifyConfigured }: LoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(describeError(searchParams.get("error")));
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          posthog.capture("user_logged_in");
          router.push(redirectTo);
        },
        onError: (ctx) => setError(ctx.error.message ?? "Failed to sign in."),
      }
    );

    setPending(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm card-shadow-lg">
        <CardHeader className="items-center text-center">
          <Logo className="mb-2" />
          <CardTitle className="font-display text-2xl font-medium">Welcome back</CardTitle>
          <CardDescription>Sign in to your CreativelyComm workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <SocialSignIn
            googleConfigured={googleConfigured}
            shopifyConfigured={shopifyConfigured}
            destination="/dashboard"
            googleCallbackURL={redirectTo}
          />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
