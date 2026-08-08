"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { pricingPlans } from "@/lib/mock-data";

export function PricingSection() {
  const plan = pricingPlans[0];
  const midpoint = Math.ceil(plan.features.length / 2);
  const firstColumn = plan.features.slice(0, midpoint);
  const secondColumn = plan.features.slice(midpoint);

  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="One plan. Everything included."
          description="$19/month for the whole platform — including the hardware workflows below. No paid add-ons, no proprietary devices to buy."
        />

        <FadeIn delay={0.1} className="mx-auto mt-16 max-w-4xl">
          <div className="grid overflow-hidden rounded-3xl border border-border-strong card-shadow-lg lg:grid-cols-[0.9fr_1.1fr]">
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
                <Link href="/signup">Start free</Link>
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

        {/* Hardware workflows note */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 sm:p-10 text-center">
          <h3 className="text-lg font-semibold">Hardware workflows are included, not sold separately</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Multi-angle capture, barcode intake, pack verification, and Quick Sale checkout all run on
            hardware you already own — your phone, a webcam, or a standard barcode scanner. Nothing
            to buy or ship.
          </p>
          <Link href="/hardware" className="mt-4 inline-block text-sm text-primary hover:underline">
            See how hardware fits in →
          </Link>
        </div>
      </div>
    </section>
  );
}
