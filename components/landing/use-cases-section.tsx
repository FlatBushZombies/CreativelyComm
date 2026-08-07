import Image from "next/image";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";

const useCases = [
  {
    label: "Storefront",
    title: "A branded storefront, out of the box",
    src: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=80",
    span: "lg:col-span-3 lg:row-span-2",
  },
  {
    label: "Marketplaces",
    title: "Shopify, Amazon, Etsy listings",
    src: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=700&q=80",
    span: "lg:col-span-2",
  },
  {
    label: "Ads & social",
    title: "Google and Meta catalog feeds",
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80",
    span: "lg:col-span-2",
  },
  {
    label: "Catalogs",
    title: "Bulk export for wholesale and CSV catalogs",
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
          title="Wherever your products need to show up."
          description="One product library feeds every surface — no re-uploading, no re-formatting."
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
