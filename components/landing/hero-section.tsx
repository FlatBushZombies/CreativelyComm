import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { HeroMockup } from "@/components/landing/hero-mockup";

const featureStrip = [
  {
    title: "Know What's Blocking You",
    description: "Every listing scored against real marketplace rules — SKUs, images, descriptions — so nothing ships broken.",
  },
  {
    title: "Fix It Before It Costs You",
    description: "Catch what's missing before a rejection, a stockout, or a lost sale finds it first.",
  },
  {
    title: "One Workspace, Every Channel",
    description: "Readiness, inventory, and orders for Shopify, Amazon, Etsy, and more — tracked in one place.",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="relative pt-28 pb-4 sm:pt-36">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground card-shadow">
              Built for brands &amp; agencies
            </p>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="font-display mt-6 text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
              Know what&apos;s blocking you.
              <br />
              <span className="font-accent text-primary">Before</span> it costs a sale.
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              The Channel Readiness Engine checks every listing against the rules each
              marketplace actually enforces — SKUs, images, descriptions, categories — so you
              catch what&apos;s missing before a rejection, a stockout, or a lost sale does it for you.
            </p>
          </FadeIn>

          <FadeIn delay={0.13}>
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium card-shadow">
              <span className="font-accent text-primary">14 days free</span>, then $19/month —
              no credit card to start
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="rounded-full px-6" asChild>
                <Link href="/signup">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="rounded-full px-6" asChild>
                <Link href="#how-it-works">
                  <PlayCircle className="h-4 w-4" />
                  See how it works
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required · Free to start</p>
          </FadeIn>
        </div>

        {/* Product preview — a compact "screenshot" of the library so the hero
            sells the actual product surface instead of lifestyle photography. */}
        <FadeIn delay={0.2} className="mx-auto mt-10 max-w-3xl px-4 sm:px-6 lg:px-8">
          <HeroMockup />
        </FadeIn>
      </div>

      {/* 3-column feature strip */}
      <div className="relative border-b border-border py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid gap-8 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {featureStrip.map((item) => (
              <StaggerItem key={item.title} className="pt-6 sm:px-8 sm:pt-0 first:sm:pl-0">
                <p className="text-lg font-bold tracking-tight sm:text-xl">{item.title}</p>
                <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
