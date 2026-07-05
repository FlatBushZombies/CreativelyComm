"use client";

import {
  Wand2,
  ImageIcon,
  Store,
  Share2,
  Zap,
  BarChart3,
  Layers,
  Globe,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";

const features = [
  {
    icon: Wand2,
    title: "AI Image Optimization",
    description:
      "Background removal, lighting enhancement, upscaling, and lifestyle backgrounds — all powered by advanced AI models.",
  },
  {
    icon: ImageIcon,
    title: "Smart Product Library",
    description:
      "Organize all your products in one place with searchable tags, categories, and version history for every image.",
  },
  {
    icon: Store,
    title: "Branded Storefront",
    description:
      "Launch a beautiful, customizable online store in minutes. Share a link or embed anywhere.",
  },
  {
    icon: Share2,
    title: "Multi-Channel Export",
    description:
      "Export marketplace-ready formats for Shopify, Amazon, Etsy, Google Merchant, and 7+ platforms.",
  },
  {
    icon: Zap,
    title: "One-Click Publishing",
    description:
      "Prepare product feeds, images, and metadata for every platform with a single click.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Track store views, export history, and optimization metrics to understand what's working.",
  },
  {
    icon: Layers,
    title: "Batch Processing",
    description:
      "Upload and optimize hundreds of products at once. Perfect for catalogs and seasonal launches.",
  },
  {
    icon: Globe,
    title: "Global Ready",
    description:
      "Multi-currency support, localized descriptions, and region-specific marketplace formats.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to sell everywhere
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From raw product photos to marketplace-ready listings — CreativelyComm
            handles the entire product marketing workflow.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/20 hover:card-shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent transition-colors group-hover:bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
