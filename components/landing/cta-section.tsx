"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-[#20401f] px-8 py-16 text-center card-shadow-glow sm:px-16">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.12),transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:3rem_3rem]" />
            {/* Floating decorative shapes, purely ornamental */}
            <div className="pointer-events-none absolute -left-8 top-8 hidden h-24 w-24 rotate-12 rounded-3xl bg-white/10 sm:block" />
            <div className="pointer-events-none absolute -right-6 bottom-10 hidden h-16 w-16 -rotate-6 rounded-full bg-white/10 sm:block" />
            <div className="pointer-events-none absolute right-16 top-10 hidden h-8 w-8 rounded-full bg-white/20 md:block" />
            <div className="relative">
              <h2 className="font-display text-3xl font-medium text-white sm:text-5xl">
                Is this product ready inside CreativelyComm?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80 text-lg">
                Make &quot;ready&quot; a real, measurable answer — not a guess. Check channel
                readiness, clean up your photos, and export marketplace-ready files for
                every platform you sell on — free to start.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="w-full sm:w-auto"
                >
                  <Link href="/signup">
                    Start free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="#pricing">View pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
