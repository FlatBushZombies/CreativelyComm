import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PlayCircle } from "lucide-react";
import { SiShopify, SiEtsy } from "react-icons/si";
import { FaAmazon } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";

const featureStrip = [
  {
    title: "10× Faster Delivery",
    description: "Automate the work that used to take days.",
  },
  {
    title: "Higher-Converting Commerce",
    description: "AI-generated marketing campaigns, social-ready formats, and optimized product content.",
  },
  {
    title: "One Product, Every Channel",
    description:
      "Prepare and publish to Shopify, Amazon, Etsy, Google, Meta, TikTok Shop, and more.",
  },
];

const previewRows = [
  {
    name: "Ceramic Vanity Set",
    price: "$28.00",
    image: "https://images.pexels.com/photos/3993398/pexels-photo-3993398.jpeg?auto=compress&cs=tinysrgb&w=100",
    readiness: "96% ready",
    channels: [SiShopify, FaAmazon, SiEtsy],
  },
  {
    name: "Handwoven Leather Tote",
    price: "$64.00",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&q=80",
    readiness: "Needs review",
    channels: [SiShopify, SiEtsy],
    ready: false,
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="relative pt-28 pb-4 sm:pt-36">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <FadeIn>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground card-shadow">
              Built for brands &amp; agencies
            </p>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="font-display mt-6 text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
              Raw photos in.
              <br />
              <span className="font-accent text-primary">Sell-everywhere</span> listings out.
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              AI cleans product photos, writes ready-to-post marketing campaigns, scores every
              listing against what each channel wants, and exports ready-to-list files — so
              teams ship 10× faster without hiring.
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
          <div className="overflow-hidden rounded-2xl border border-border-strong bg-card text-left card-shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              <span className="ml-3 text-xs font-medium text-muted-foreground">Product Library</span>
            </div>
            <div className="divide-y divide-border">
              {previewRows.map((row) => (
                <div key={row.name} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                    <Image src={row.image} alt="" fill className="object-cover" sizes="44px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.price}</p>
                  </div>
                  <Badge variant={row.ready === false ? "muted" : "success"} className="hidden shrink-0 sm:inline-flex">
                    {row.readiness}
                  </Badge>
                  <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                    {row.channels.map((Icon, i) => (
                      <Icon key={i} className="h-3.5 w-3.5 text-foreground/50" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
