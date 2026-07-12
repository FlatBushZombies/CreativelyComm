"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { pricingPlans } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-8 lg:grid-cols-3 lg:items-center">
          {pricingPlans.map((plan) => (
            <StaggerItem
              key={plan.name}
              className={plan.highlighted ? "lg:-translate-y-4" : ""}
            >
              <div
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-2xl border p-8 transition-all",
                  plan.highlighted
                    ? "border-primary/40 bg-card card-shadow-glow scale-[1.02] ring-1 ring-primary/15"
                    : "border-border bg-card card-shadow"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 h-1.5",
                    plan.highlighted ? "bg-primary" : "bg-border"
                  )}
                />
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 shadow-sm">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-medium">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-3 w-3 text-primary" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
