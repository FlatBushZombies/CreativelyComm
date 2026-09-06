import { Sparkles, Wand2, Crop } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";

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

        <StaggerContainer className="mt-10 grid gap-4 sm:grid-cols-3">
          {included.map((item) => (
            <StaggerItem key={item.title}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-border-strong bg-card p-5 card-shadow">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
