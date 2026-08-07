"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Scissors, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

const channelScores = [
  { label: "Shopify", pct: 100 },
  { label: "Amazon", pct: 94 },
  { label: "Etsy", pct: 78 },
];

const ruleChecks = [
  { label: "4+ product images", passed: true },
  { label: "Description present", passed: true },
  { label: "SKU assigned", passed: false },
];

const productThumbnails = [
  "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&q=80",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&q=80",
  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32">
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-60" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Channel Readiness Engine
            </p>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="font-display mt-5 text-[2.75rem] font-medium leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[5.25rem]">
              Never publish a listing that gets rejected.
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Every marketplace has its own rules for photos, fields, and
              formatting. CreativelyComm scores each listing against them
              before you publish, cleans up product photos in one click, and
              exports ready-to-list files for Shopify, Amazon, Etsy, and more.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" className="rounded-full px-6" asChild>
                <Link href="/signup">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full px-6" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Free to start
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.25} className="relative mt-16 sm:mt-20">
          <div className="overflow-hidden rounded-[1.75rem] border border-border-strong bg-card card-shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3.5 sm:px-6">
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                creativelycomm.app/products/artisan-ceramic-mug
              </span>
            </div>

            <div className="grid lg:grid-cols-[1.35fr_1fr]">
              <div className="border-b border-border p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=900&q=80"
                    alt="Artisan ceramic mug product photo in the CreativelyComm workspace canvas"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 640px"
                    priority
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
                    Original
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-3 right-3 opacity-95"
                  >
                    <Scissors className="h-3.5 w-3.5" />
                    Remove background
                  </Button>
                </div>
                <div className="mt-3 flex gap-2">
                  {productThumbnails.map((src, i) => (
                    <div
                      key={src}
                      className={cn(
                        "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2",
                        i === 0 ? "border-primary" : "border-transparent"
                      )}
                    >
                      <Image src={src} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <p className="text-sm font-medium">Artisan Ceramic Mug</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  4 photos · 3 channels selected
                </p>

                <div className="mt-5 space-y-3.5">
                  {channelScores.map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{row.label}</span>
                        <span className="text-muted-foreground">{row.pct}%</span>
                      </div>
                      <Progress value={row.pct} className="mt-1.5 h-1.5" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-2.5 border-t border-border pt-5">
                  {ruleChecks.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      {rule.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <span className={rule.passed ? "" : "text-muted-foreground"}>
                        {rule.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
