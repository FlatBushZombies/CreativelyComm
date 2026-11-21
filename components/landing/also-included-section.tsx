import { Sparkles, Wand2, Crop, FileOutput } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";

// Explicit, hand-picked gradients (same on-brand palette as
// lib/folder-utils.ts) rather than the hash-based colorForFolder() —
// with only 4 fixed tiles, hashing risked collisions (two tiles landing on
// the same color), so each is assigned directly for maximum contrast.
const included = [
  {
    icon: Sparkles,
    title: "Campaigns that create momentum",
    description:
      "Turn one product into a launch plan — headline, ad copy, captions, email, and a follow-up message — with a clear next step for every channel.",
    gradient: { from: "#386641", to: "#5b8a66" }, // forest green
  },
  {
    icon: Wand2,
    title: "Visuals made for where they sell",
    description:
      "Create clean, consistent product photography designed for the storefront and marketplace audiences you are preparing to reach.",
    gradient: { from: "#2f6b66", to: "#4f9c92" }, // deep teal
  },
  {
    icon: Crop,
    title: "Know the moment shoppers leave",
    description:
      "See which variants, details, bundles, or checkout steps hold attention — and which ones quietly stop a sale.",
    gradient: { from: "#a85a34", to: "#d68a56" }, // clay / terracotta
  },
  {
    icon: FileOutput,
    title: "Carry the launch across channels",
    description:
      "Move from one Shopify product to marketplace-ready listings for Amazon, Etsy, TikTok Shop, Google, Meta, and beyond.",
    gradient: { from: "#6b4a63", to: "#9a6f8f" }, // plum
  },
];

export function AlsoIncludedSection() {
  return (
    <section id="how-it-works" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="One guided workflow"
          title="From first product to sale-ready launch."
          description="Bring your Shopify catalog into one workspace, find what needs attention, improve the funnel, and prepare every product for its next sales channel."
        />

        <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-2">
          {included.map((item) => (
            <StaggerItem key={item.title}>
              <div
                className="relative flex h-full flex-col overflow-hidden rounded-3xl p-6 sm:p-8"
                style={{ background: `linear-gradient(135deg, ${item.gradient.from}, ${item.gradient.to})` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <p className="mt-6 text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">{item.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
