import Link from "next/link";
import { ArrowRight, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/sidebar";

export default function DashboardNotFound() {
  return (
    <>
      <DashboardHeader title="Not found" />

      <div className="flex flex-1 flex-col items-center justify-center p-4 text-center sm:p-6 lg:p-8">
        <div className="relative">
          <p className="font-display text-6xl font-medium leading-none tracking-tight text-foreground sm:text-7xl">
            404
          </p>
          <span className="absolute -right-3 -top-3 flex -rotate-6 items-center gap-1.5 rounded-full border border-border-strong bg-card px-2.5 py-1 text-xs font-medium card-shadow-lg">
            <X className="h-3 w-3 text-muted-foreground" />
            Not found
          </span>
        </div>

        <h1 className="font-display mt-4 text-xl font-medium tracking-tight sm:text-2xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          It may have been deleted, renamed, or the link is just wrong. Nothing else in your
          workspace was affected.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button className="rounded-full px-5" asChild>
            <Link href="/dashboard">
              Back to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="rounded-full px-5" asChild>
            <Link href="/products">
              <Package className="h-4 w-4" />
              Browse products
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
