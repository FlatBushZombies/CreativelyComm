import { Sparkles, Wand2, Crop, FileOutput } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { colorForFolder } from "@/lib/folder-utils";

const included = [
  {
    icon: Sparkles,
    title: "AI campaign generator",
    description:
      "Turn a product into a ready-to-post campaign — headline, captions, hashtags, and an email or WhatsApp message, fully editable before it goes live.",
  },
  {
    icon: Wand2,
    title: "AI lifestyle photos",
    description:
      "Generate a lifestyle scene behind a product photo, or drop it onto a clean white background instead — no design software needed.",
  },
  {
    icon: Crop,
    title: "Social format fitting",
    description:
      "Auto-fit a photo to Instagram's square, Pinterest's vertical pin, or a Facebook carousel, right from the product page.",
  },
  {
    icon: FileOutput,
    title: "Export-ready files",
    description:
      "Generate Shopify CSVs, Amazon flat files, Etsy listings, and Google or Meta feeds — all from one product library.",
  },
];

export function AlsoIncludedSection() {
  return (
    <section id="how-it-works" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Also included"
          title="Once a listing is ready, here's what else the workspace does."
          description="The readiness score is the starting point — these are the tools that get a product from 'ready' to 'live' without leaving the workspace."
        />

        <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-2">
          {included.map((item) => {
            const gradient = colorForFolder(item.title);
            return (
              <StaggerItem key={item.title}>
                <div
                  className="relative flex h-full flex-col overflow-hidden rounded-3xl p-6 sm:p-8"
                  style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="mt-6 text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">{item.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
