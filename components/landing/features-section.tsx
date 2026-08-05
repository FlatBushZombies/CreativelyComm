"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Scissors, RefreshCw, type LucideIcon } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

interface CapabilityCard {
  icon: LucideIcon;
  label: string;
  statement: string;
  reply: string;
  tone: "brand" | "neutral";
  span?: string;
}

// Each card keeps the reference's "conversation" shape -- avatar, bold
// statement, lighter reply bubble underneath -- but the content is an
// honest capability callout, not an invented customer quote.
const cards: CapabilityCard[] = [
  {
    icon: ShieldCheck,
    label: "Readiness Engine",
    statement: "Never guess if a listing is ready.",
    reply: "Real per-channel scoring against rules you control — not a generic checklist.",
    tone: "brand",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    icon: Scissors,
    label: "Photo cleanup",
    statement: "Skip the photo editor entirely.",
    reply: "One-click background removal, powered by Remove.bg.",
    tone: "neutral",
    span: "lg:col-start-3 lg:row-start-1",
  },
  {
    icon: RefreshCw,
    label: "Shopify sync",
    statement: "Stop re-typing stock counts.",
    reply: "Two-way sync keeps products and inventory identical, in both directions.",
    tone: "neutral",
    span: "lg:col-start-3 lg:row-start-2",
  },
];

function CapabilityCardView({ card }: { card: CapabilityCard }) {
  const isBrand = card.tone === "brand";
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-between rounded-2xl border p-6 sm:p-7",
        isBrand
          ? "border-transparent bg-primary text-primary-foreground card-shadow-glow"
          : "border-border bg-card card-shadow"
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              isBrand ? "bg-white/15" : "bg-accent"
            )}
          >
            <card.icon className={cn("h-5 w-5", isBrand ? "text-white" : "text-primary")} />
          </span>
          <span
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              isBrand ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {card.label}
          </span>
        </div>

        <p className={cn("mt-5 font-display text-xl font-medium sm:text-2xl", isBrand ? "text-white" : "text-foreground")}>
          {card.statement}
        </p>
      </div>

      <div
        className={cn(
          "mt-6 w-fit max-w-full rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed",
          isBrand ? "bg-white/12 text-white/90" : "bg-muted text-muted-foreground"
        )}
      >
        {card.reply}
      </div>
    </div>
  );
}

// Renamed from the original FeaturesSection: this now covers the reference
// layout's "Increase efficiency & drive growth" block (asymmetric heading +
// three conversation-shaped capability cards). The exhaustive feature list
// lives further down in FeatureDeepDiveSection (workflow-section.tsx).
export function EfficiencySection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Asymmetric heading row: left-aligned heading, short paragraph pinned right */}
        <FadeIn className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-12">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
            Increase efficiency,
            <br />
            skip the guesswork
          </h2>
          <p className="text-lg text-muted-foreground lg:text-right">
            The product experience starts long before checkout. CreativelyComm is where
            it gets organized, scored, and cleaned up first.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Link
            href="/signup"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            Get Started
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </FadeIn>

        <StaggerContainer className="mt-10 grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
          {cards.map((card) => (
            <StaggerItem key={card.label} className={card.span}>
              <CapabilityCardView card={card} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
