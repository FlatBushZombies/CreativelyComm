import Image from "next/image";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";

const useCases = [
  {
    label: "Capture",
    title: "Hardware photo booth for consistent shots",
    src: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=80",
    span: "lg:col-span-3 lg:row-span-2",
  },
  {
    label: "Marketplaces",
    title: "Ready-to-list on Shopify, Amazon, Etsy",
    src: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=700&q=80",
    span: "lg:col-span-2",
  },
  {
    label: "Fulfillment",
    title: "Pack verification + in-person POS",
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80",
    span: "lg:col-span-2",
  },
  {
    label: "Ads & Retargeting",
    title: "Meta/Google feeds + offline-to-online audience syncing",
    src: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900&q=80",
    span: "lg:col-span-3",
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Use cases"
          title="From raw photo to multi-channel sales."
          description="Integrated software + hardware systems solve the entire product intelligence pipeline — capture, clean, score, verify, and sell everywhere."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-5 lg:auto-rows-[220px]">
          {useCases.map((item) => (
            <FadeIn
              key={item.label}
              className={cn("group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border-strong lg:aspect-auto lg:h-auto", item.span)}
            >
              <Image
                src={item.src}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/70">
                  {item.label}
                </p>
                <p className="font-display mt-1.5 max-w-xs text-lg font-medium text-white sm:text-xl">
                  {item.title}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
