"use client";

import Image from "next/image";
import { Upload, Wand2, Store, Share2, Check } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload your products",
    description:
      "Drag and drop product photos and details, or import your whole catalog from a CSV in one go.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
  },
  {
    step: "02",
    icon: Wand2,
    title: "Check readiness, clean up photos",
    description:
      "See a real readiness score for every marketplace, then remove backgrounds with one click.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
  },
  {
    step: "03",
    icon: Store,
    title: "Launch your storefront",
    description:
      "Customize your branded store with your colors and layout. Share a link, or embed it on your own site.",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
  },
  {
    step: "04",
    icon: Share2,
    title: "Export & publish everywhere",
    description:
      "One-click export to real, marketplace-ready files for Shopify, Amazon, Etsy, Google Merchant, and more.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
            From upload to everywhere in 4 steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A streamlined workflow designed for speed. Go from raw photos to
            live listings in under an hour.
          </p>
        </FadeIn>

        <div className="mt-20 space-y-24">
          {steps.map((step, index) => (
            <FadeIn key={step.step} delay={index * 0.1}>
              <div
                className={`flex flex-col items-center gap-10 lg:gap-16 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-accent/30 shadow-[0_8px_20px_-8px_rgba(56,102,65,0.35)]">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-display mt-4 text-2xl font-medium">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="mt-6 space-y-2">
                    {["Automated processing", "Real-time preview", "Real version history"].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-3 w-3 text-primary" />
                          </span>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="relative flex-1 w-full">
                  <span
                    className={`font-display pointer-events-none absolute -top-10 z-0 text-[7rem] leading-none text-primary/10 sm:text-[9rem] ${
                      index % 2 === 0 ? "-left-4 sm:-left-8" : "-right-4 sm:-right-8"
                    }`}
                  >
                    {step.step}
                  </span>
                  <div className="relative z-10 aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 card-shadow-lg ring-1 ring-black/[0.03]">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
