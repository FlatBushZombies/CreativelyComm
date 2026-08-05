"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";
import { pricingPlans } from "@/lib/mock-data";

export function PricingSection() {
  const plan = pricingPlans[0];
  const midpoint = Math.ceil(plan.features.length / 2);
  const firstColumn = plan.features.slice(0, midpoint);
  const secondColumn = plan.features.slice(midpoint);

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
            One plan. Everything included.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No tiers to compare, no feature paywalled behind an upsell.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="mx-auto mt-16 max-w-4xl">
          <div className="grid overflow-hidden rounded-3xl border border-border card-shadow-lg lg:grid-cols-[0.9fr_1.1fr]">
            {/* Bold color-blocked price panel */}
            <div className="flex flex-col justify-between bg-primary p-8 text-primary-foreground sm:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
                  {plan.name}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-6xl font-medium">${plan.price}</span>
                  <span className="text-white/70">/month</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/80">{plan.description}</p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="mt-8 w-full rounded-full sm:w-auto"
              >
                <Link href="/signup">Get started</Link>
              </Button>
            </div>

            {/* Feature checklist panel */}
            <div className="bg-card p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Everything included
              </p>
              <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {[firstColumn, secondColumn].map((column, columnIndex) => (
                  <ul key={columnIndex} className="space-y-3">
                    {column.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-3 w-3 text-primary" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
