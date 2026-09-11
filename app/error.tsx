"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="px-6 py-6 sm:px-10">
        <Logo />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        <h1 className="font-display mt-5 text-2xl font-medium tracking-tight sm:text-4xl">
          Something went wrong.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          That&apos;s on us, not you. Try again — if it keeps happening, let us know and
          we&apos;ll look into it.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground/70">Error ID: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="rounded-full px-6" onClick={() => reset()}>
            <RotateCw className="h-4 w-4" />
            Try again
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
            <Link href="mailto:support@creativelycomm.com">Contact support</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
