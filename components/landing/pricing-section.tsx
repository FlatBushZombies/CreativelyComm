"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { pricingPlans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section id="pricing" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Simple pricing that scales with you."
          description="Start free, upgrade when you're ready, go custom when you outgrow the plan."
        />

        <StaggerContainer className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3 md:items-start">
          {pricingPlans.map((plan) => (
            <StaggerItem key={plan.id} className="h-full">
              <div
                className={cn(
                  "flex h-full flex-col rounded-3xl border p-7 sm:p-8",
                  plan.highlighted
                    ? "border-primary bg-primary text-primary-foreground card-shadow-glow md:-translate-y-3"
                    : "border-border-strong bg-card card-shadow"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wide",
                      plan.highlighted ? "text-white/70" : "text-muted-foreground"
                    )}
                  >
                    {plan.name}
                  </p>
                  {plan.highlighted && (
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
                      Most popular
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-medium">{plan.priceLabel}</span>
                  <span className={cn("text-sm", plan.highlighted ? "text-white/70" : "text-muted-foreground")}>
                    {plan.period}
                  </span>
                </div>

                <p
                  className={cn(
                    "mt-3 text-sm leading-relaxed",
                    plan.highlighted ? "text-white/80" : "text-muted-foreground"
                  )}
                >
                  {plan.description}
                </p>

                <Button
                  size="lg"
                  variant={plan.highlighted ? "secondary" : "outline"}
                  asChild
                  className="mt-6 w-full rounded-full"
                >
                  {plan.cta.href.startsWith("mailto:") ? (
                    <a href={plan.cta.href}>{plan.cta.label}</a>
                  ) : (
                    <Link href={plan.cta.href}>{plan.cta.label}</Link>
                  )}
                </Button>

                <ul
                  className={cn(
                    "mt-7 space-y-3 border-t pt-6 text-sm",
                    plan.highlighted ? "border-white/15" : "border-border"
                  )}
                >
                  {plan.features.map((feature) =>
                    feature.endsWith(":") ? (
                      <li
                        key={feature}
                        className={cn(
                          "-mt-1 text-xs font-semibold uppercase tracking-wide",
                          plan.highlighted ? "text-white/60" : "text-muted-foreground"
                        )}
                      >
                        {feature}
                      </li>
                    ) : (
                      <li key={feature} className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            plan.highlighted ? "bg-white/15" : "bg-primary/10"
                          )}
                        >
                          <Check className={cn("h-3 w-3", plan.highlighted ? "text-white" : "text-primary")} />
                        </span>
                        {feature}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.1} className="mt-8 text-center text-sm text-muted-foreground">
          No credit card required to start. Cancel anytime.
        </FadeIn>
      </div>
    </section>
  );
}
