"use client";

import {
  ShieldCheck,
  Scissors,
  Store,
  Share2,
  Languages,
  Users,
  FileSpreadsheet,
  Settings2,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";

const features = [
  {
    icon: ShieldCheck,
    title: "Channel Readiness Engine",
    description:
      "Get a real readiness score for every marketplace before you publish — see exactly what's missing instead of finding out after a rejection.",
  },
  {
    icon: Scissors,
    title: "One-Click Background Removal",
    description:
      "Strip backgrounds from product photos instantly, powered by Remove.bg — no design tools required.",
  },
  {
    icon: Store,
    title: "Branded Storefront & Embeds",
    description:
      "Launch a customizable online store in minutes. Share a link, or embed your product grid directly on your own website.",
  },
  {
    icon: Share2,
    title: "Real Multi-Channel Export",
    description:
      "Generate real, marketplace-ready feed files for Shopify, Amazon, Etsy, Google Merchant, and 7+ platforms — one click, no guesswork.",
  },
  {
    icon: Languages,
    title: "Multi-Language Listings",
    description:
      "Translate product names and descriptions for cross-border marketplaces, powered by DeepL — with a real version history behind every change.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite teammates with owner, admin, editor, or viewer roles — everyone works from the same product library.",
  },
  {
    icon: FileSpreadsheet,
    title: "CSV Import & Bulk Editing",
    description:
      "Import your whole catalog from a spreadsheet, or bulk-edit prices, categories, and status right in the table.",
  },
  {
    icon: Settings2,
    title: "Customizable Rules & API Access",
    description:
      "Add your own readiness checks on top of the defaults, and connect the API to your own scripts or automations.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
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
              <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:card-shadow-glow">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-accent/30 shadow-[0_8px_24px_-8px_rgba(56,102,65,0.35)] transition-transform duration-300 group-hover:scale-105">
                  <feature.icon className="h-6 w-6 text-primary" />
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
