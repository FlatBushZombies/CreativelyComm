import { Upload, Wand2, Share2 } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload",
    description: "Bring in product photos and details one at a time, or import a whole catalog from a spreadsheet.",
  },
  {
    icon: Wand2,
    number: "02",
    title: "Refine",
    description: "Remove backgrounds, translate listings, and check readiness against the rules each channel cares about.",
  },
  {
    icon: Share2,
    number: "03",
    title: "Publish",
    description: "Export ready-to-list files, sync inventory both ways, or share your branded storefront link.",
  },
];

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="One workspace, start to finish."
          description="Every product moves through the same three steps — no separate tools to stitch together."
        />

        <StaggerContainer className="relative mt-16 grid gap-10 sm:grid-cols-3 sm:gap-6">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-6 hidden h-px bg-border sm:block"
          />
          {steps.map((step) => (
            <StaggerItem key={step.title} className="relative flex flex-col items-start">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-background text-primary">
                <step.icon className="h-5 w-5" />
              </span>
              <span className="mt-5 font-mono text-xs text-muted-foreground">{step.number}</span>
              <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
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
