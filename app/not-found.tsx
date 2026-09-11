import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="hero-gradient flex min-h-screen flex-col bg-background">
      <header className="px-6 py-6 sm:px-10">
        <Logo />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <div className="relative">
          <p className="font-display text-[7rem] font-medium leading-none tracking-tight text-foreground sm:text-[10rem]">
            404
          </p>
          <span className="absolute -right-4 top-2 flex -rotate-6 items-center gap-1.5 rounded-full border border-border-strong bg-card px-3 py-1.5 text-xs font-medium card-shadow-lg sm:-right-8 sm:top-4">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
            Not found
          </span>
        </div>

        <h1 className="font-display mt-4 text-2xl font-medium tracking-tight sm:text-4xl">
          This listing doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          The page you&apos;re looking for was moved, renamed, or never existed — even the
          Channel Readiness Engine can&apos;t score a page that isn&apos;t there.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="rounded-full px-6" asChild>
            <Link href="/">
              Back to homepage
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="rounded-full px-6" asChild>
            <Link href="/dashboard">
              <Search className="h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
