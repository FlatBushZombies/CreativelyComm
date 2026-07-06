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
      "Drag and drop product images and details. Import from CSV or connect your existing catalog.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
  },
  {
    step: "02",
    icon: Wand2,
    title: "AI optimizes everything",
    description:
      "Our AI removes backgrounds, enhances lighting, generates lifestyle shots, and creates marketplace-ready images.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
  },
  {
    step: "03",
    icon: Store,
    title: "Launch your storefront",
    description:
      "Customize your branded store with your colors, logo, and layout. Preview on any device.",
    image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=80",
  },
  {
    step: "04",
    icon: Share2,
    title: "Export & publish everywhere",
    description:
      "One-click export to Shopify, Amazon, Etsy, Google Merchant, Facebook, TikTok Shop, and more.",
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

        <div className="mt-16 space-y-20">
          {steps.map((step, index) => (
            <FadeIn key={step.step} delay={index * 0.1}>
              <div
                className={`flex flex-col items-center gap-10 lg:gap-16 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-2xl text-primary/50">{step.step}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-display mt-4 text-2xl font-medium">{step.title}</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  <ul className="mt-6 space-y-2">
                    {["Automated processing", "Real-time preview", "Undo & version history"].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="flex-1 w-full">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 card-shadow-lg ring-1 ring-black/[0.03]">
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
