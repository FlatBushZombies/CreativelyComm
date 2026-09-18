"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { SiGoogle } from "react-icons/si";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/shared/logo";
import { authClient } from "@/lib/auth/auth-client";

interface LoginClientProps {
  googleConfigured: boolean;
}

export function LoginClient({ googleConfigured }: LoginClientProps) {
  return (
    <Suspense fallback={null}>
      <LoginForm googleConfigured={googleConfigured} />
    </Suspense>
  );
}

function LoginForm({ googleConfigured }: LoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
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

  function handleGoogleSignIn() {
    posthog.capture("google_auth_started", { intent: "login" });
    authClient.signIn.social({ provider: "google", callbackURL: redirectTo });
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
          {googleConfigured && (
            <>
              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                <SiGoogle className="h-4 w-4" />
                Continue with Google
              </Button>
              <div className="my-4 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>
            </>
          )}
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
