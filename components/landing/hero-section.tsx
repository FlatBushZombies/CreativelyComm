import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";

const featureStrip = [
  {
    title: "10× Faster Delivery",
    description: "Automate the work that used to take days.",
  },
  {
    title: "Higher-Converting Commerce",
    description: "AI-powered pages, upsells, bundles, and optimized product content.",
  },
  {
    title: "One Product, Every Channel",
    description:
      "Prepare and publish to Shopify, Amazon, Etsy, Google, Meta, TikTok Shop, and more.",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative flex min-h-[92vh] items-center pt-32 pb-20 sm:min-h-screen sm:pt-40 sm:pb-24">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/3814573/pexels-photo-3814573.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="A small workshop where a craftsman and an assistant prepare a handmade leather bag"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Same dark linear-gradient overlay technique used in use-cases-section.tsx,
              layered on two axes so left-aligned text stays legible across the full photo. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <FadeIn>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                Built for brands &amp; agencies
              </p>
            </FadeIn>

            <FadeIn delay={0.05}>
              <h1 className="mt-5 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]">
                Raw photos in.
                <br />
                <span className="font-accent text-primary">Sell-everywhere</span> listings out.
              </h1>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
                AI handles product photos, copy, layouts, SEO, bundles, and channel requirements
                so teams can ship 10× faster, sell better, and scale without hiring.
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
                <Button
                  size="lg"
                  variant="ghost"
                  className="rounded-full px-6 text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-white/70">No credit card required · Free to start</p>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* 3-column feature strip, reusing the divided-stat-strip pattern from proof-section.tsx. */}
      <div className="relative border-b border-border py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid gap-10 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {featureStrip.map((item) => (
              <StaggerItem key={item.title} className="pt-8 sm:px-8 sm:pt-0 first:sm:pl-0">
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
