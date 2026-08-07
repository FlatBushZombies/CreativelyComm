import Image from "next/image";
import { Scissors, Sparkles, CheckCircle2, XCircle, Settings2 } from "lucide-react";
import { SiShopify, SiEtsy, SiGoogle, SiFacebook, SiTiktok } from "react-icons/si";
import { FaAmazon } from "react-icons/fa6";
import { FadeIn } from "@/components/shared/fade-in";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FeatureStoryProps {
  number: string;
  label: string;
  title: React.ReactNode;
  description: string;
  visual: React.ReactNode;
  layout: "visual-right" | "visual-left" | "visual-full";
}

function FeatureStory({ number, label, title, description, visual, layout }: FeatureStoryProps) {
  const text = (
    <FadeIn direction={layout === "visual-left" ? "right" : "left"} className="max-w-md">
      <p className="flex items-baseline gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
        <span className="font-mono text-muted-foreground">{number}</span>
        {label}
      </p>
      <h3 className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
        {title}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
    </FadeIn>
  );

  if (layout === "visual-full") {
    return (
      <div>
        <FadeIn>{visual}</FadeIn>
        <div className="mt-8 max-w-2xl">{text}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
        layout === "visual-left" && "lg:[&>*:first-child]:order-2"
      )}
    >
      {text}
      <FadeIn direction={layout === "visual-left" ? "left" : "right"} delay={0.1}>
        {visual}
      </FadeIn>
    </div>
  );
}

const ruleChecks = [
  { label: "Has care instructions", channel: "Etsy", weight: 10, passed: true },
  { label: "SKU present", channel: "Amazon", weight: 15, passed: true },
  { label: "4+ product images", channel: "Shopify", weight: 12, passed: false },
];

const exportChannels = [
  { name: "Shopify", icon: SiShopify, status: "Exported" },
  { name: "Amazon", icon: FaAmazon, status: "Exported" },
  { name: "Etsy", icon: SiEtsy, status: "Ready" },
  { name: "Google", icon: SiGoogle, status: "Ready" },
  { name: "Meta", icon: SiFacebook, status: "Pending" },
  { name: "TikTok", icon: SiTiktok, status: "Ready" },
];

export function FeatureStorySection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl space-y-24 px-4 sm:space-y-32 sm:px-6 lg:px-8">
        <FeatureStory
          number="01"
          label="Clean"
          layout="visual-right"
          title="Clean product photos without a photo editor."
          description="Select an image and remove the background instantly, powered by Remove.bg. Upload from your phone, integrate with our optional Capture Dock hardware for auto-cleaned multi-angle shots, or use raw photos from anywhere. No round-trip to Photoshop, no waiting on a designer."
          visual={
            <div className="overflow-hidden rounded-2xl border border-border-strong bg-card card-shadow-lg">
              <div className="relative aspect-square">
                <Image
                  src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700&q=80"
                  alt="Product photo canvas with a background removal control"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  Optimized
                </span>
              </div>
              <div className="flex items-center border-t border-border p-1.5">
                <span className="flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium text-muted-foreground">
                  Original
                </span>
                <span className="flex-1 rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-accent-foreground">
                  <Scissors className="mr-1.5 inline h-3.5 w-3.5" />
                  Background removed
                </span>
              </div>
            </div>
          }
        />

        <FeatureStory
          number="02"
          label="Standardize"
          layout="visual-left"
          title="Know exactly what's blocking a listing."
          description="The Channel Readiness Engine checks every product against rules you control — per marketplace, weighted, and customizable. No more guessing why a listing got rejected."
          visual={
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
          }
        />

        <FeatureStory
          number="03"
          label="Publish"
          layout="visual-full"
          title="Export files every marketplace already expects."
          description="Generate Shopify CSVs, Amazon Seller Central flat files, Etsy listings, and Google or Meta feeds — all from one product library, all in the format each channel actually wants."
          visual={
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {exportChannels.map(({ name, icon: Icon, status }) => (
                <div
                  key={name}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border-strong bg-card p-6 text-center card-shadow"
                >
                  <Icon className="h-6 w-6 text-foreground/80" />
                  <span className="text-sm font-medium">{name}</span>
                  <Badge variant={status === "Pending" ? "muted" : "success"}>{status}</Badge>
                </div>
              ))}
            </div>
          }
        />
      </div>
    </section>
  );
}
