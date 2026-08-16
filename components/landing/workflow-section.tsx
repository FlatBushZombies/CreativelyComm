import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";
import { SiShopify, SiEtsy, SiGoogle } from "react-icons/si";
import { FaAmazon } from "react-icons/fa6";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

// Same three product thumbnails used for the mockup that previously lived in
// hero-section.tsx — reused here as the "Upload" card's glass-panel snippet.
const productThumbnails = [
  "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&q=80",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&q=80",
  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
];

// Same readiness-rule-checklist pattern used in hero-section.tsx's old mockup
// and features-section.tsx's "Standardize" block.
const ruleChecks = [
  { label: "4+ product images", passed: true },
  { label: "Description present", passed: true },
  { label: "SKU assigned", passed: false },
];

// Same channel-badge pattern used in features-section.tsx's "03 Publish" block.
const publishChannels = [
  { name: "Shopify", icon: SiShopify },
  { name: "Amazon", icon: FaAmazon },
  { name: "Etsy", icon: SiEtsy },
  { name: "Google", icon: SiGoogle },
];

const steps = [
  {
    number: "01",
    title: "Upload",
    description:
      "Bring in product photos and details one at a time, or import a whole catalog from a spreadsheet.",
    photo:
      "https://images.pexels.com/photos/8154659/pexels-photo-8154659.jpeg?auto=compress&cs=tinysrgb&w=900",
    photoAlt: "A seller photographing products with a smartphone before uploading them",
    panelLabel: "Product photos",
    panel: (
      <div className="flex gap-2">
        {productThumbnails.map((src, i) => (
          <div
            key={src}
            className={cn(
              "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2",
              i === 0 ? "border-primary" : "border-white/30"
            )}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="48px" />
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "02",
    title: "Refine",
    description:
      "Remove backgrounds, translate listings, and check readiness against the rules each channel cares about.",
    photo:
      "https://images.pexels.com/photos/7014405/pexels-photo-7014405.jpeg?auto=compress&cs=tinysrgb&w=900",
    photoAlt: "A seller reviewing edited product photos on a laptop",
    panelLabel: "Readiness check",
    panel: (
      <div className="space-y-1.5">
        {ruleChecks.map((rule) => (
          <div key={rule.label} className="flex items-center gap-1.5 text-xs">
            {rule.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            ) : (
              <XCircle className="h-3.5 w-3.5 shrink-0 text-white/50" />
            )}
            <span className={rule.passed ? "text-white" : "text-white/60"}>{rule.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    title: "Publish",
    description:
      "Export ready-to-list files, sync inventory both ways, or share your branded storefront link.",
    photo:
      "https://images.pexels.com/photos/4440800/pexels-photo-4440800.jpeg?auto=compress&cs=tinysrgb&w=900",
    photoAlt: "Stacked boxes ready to ship after products are published to every channel",
    panelLabel: "Publishing to",
    panel: (
      <div className="flex flex-wrap gap-1.5">
        {publishChannels.map(({ name, icon: Icon }) => (
          <span
            key={name}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-medium text-white"
          >
            <Icon className="h-3 w-3" />
            {name}
          </span>
        ))}
      </div>
    ),
  },
];

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">How we work</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every product moves through the same three steps — no separate tools to stitch
            together.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <StaggerItem key={step.title} className="flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-border-strong">
                <Image
                  src={step.photo}
                  alt={step.photoAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

                <div className="absolute inset-x-4 top-4 rounded-xl border border-white/20 bg-black/30 p-3 backdrop-blur-md">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    {step.panelLabel}
                  </p>
                  {step.panel}
                </div>

                <span className="absolute bottom-4 left-4 font-mono text-xs text-white/70">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
