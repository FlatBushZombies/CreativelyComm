import { CheckCircle2, XCircle, Settings2, Gauge, Globe2, Layers } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { Badge } from "@/components/ui/badge";

const ruleChecks = [
  { label: "Has search tags", channel: "Etsy", weight: 35, passed: false },
  { label: "SKU present", channel: "Amazon", weight: 25, passed: true },
  { label: "3+ product images", channel: "Amazon", weight: 30, passed: false },
];

const bullets = [
  {
    icon: Gauge,
    title: "Real-time readiness scoring",
    description: "A live percentage score for every product, per marketplace, updated the moment something changes.",
  },
  {
    icon: Globe2,
    title: "Works across every channel",
    description: "Shopify, Amazon, Etsy, Google, Meta, TikTok — each with its own rule set, not a generic checklist.",
  },
  {
    icon: Layers,
    title: "Bulk-fix in one place",
    description: "Catch what's missing across your whole catalog and fix it in bulk, not product by product.",
  },
];

export function FeatureStorySection() {
  return (
    <section id="features" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <FadeIn direction="right" className="rounded-3xl bg-accent p-6 sm:p-10">
            <div className="rounded-2xl border border-border-strong bg-card p-6 card-shadow-lg sm:p-7">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Readiness rules</span>
              </div>
              <div className="mt-5 space-y-3">
                {ruleChecks.map((rule) => (
                  <div
                    key={rule.label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {rule.passed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="truncate text-sm">{rule.label}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="secondary">{rule.channel}</Badge>
                      <span className="text-xs text-muted-foreground">w{rule.weight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.1}>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Standardize</p>
            <h2 className="font-display mt-3 text-2xl font-medium tracking-tight sm:text-4xl">
              Know exactly what&apos;s blocking a listing.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The Channel Readiness Engine checks every product against rules you control — per
              marketplace, weighted, and customizable. No more guessing why a listing got rejected.
            </p>

            <StaggerContainer className="mt-8 space-y-5">
              {bullets.map((bullet) => (
                <StaggerItem key={bullet.title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <bullet.icon className="h-4 w-4 text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{bullet.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{bullet.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
