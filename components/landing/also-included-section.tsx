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
    title: "AI funnel campaigns",
    description:
      "Turn one product into a launch funnel — headline, ad copy, captions, email, and WhatsApp message — with clear next steps for your first campaign.",
    gradient: { from: "#386641", to: "#5b8a66" }, // forest green
  },
  {
    icon: Wand2,
    title: "Product-ready visuals",
    description:
      "Create clean background and lifestyle versions that fit the requirements of the channels you are preparing to sell on.",
    gradient: { from: "#2f6b66", to: "#4f9c92" }, // deep teal
  },
  {
    icon: Crop,
    title: "SKU-level funnel signals",
    description:
      "See where shoppers stop inside a specific product — variant clicks, ingredient tabs, bundle choices, and checkout drop-offs.",
    gradient: { from: "#a85a34", to: "#d68a56" }, // clay / terracotta
  },
  {
    icon: FileOutput,
    title: "End-to-end channel exports",
    description:
      "Move from Shopify setup to marketplace-ready feeds for Amazon, Etsy, TikTok Shop, Google, Meta, and more.",
    gradient: { from: "#6b4a63", to: "#9a6f8f" }, // plum
  },
];

export function AlsoIncludedSection() {
  return (
    <section id="how-it-works" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="One guided workflow"
          title="Create, check, improve, and launch every product."
          description="Start with a Shopify store, then use one workspace to build a marketplace-ready product funnel without juggling disconnected tools."
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
