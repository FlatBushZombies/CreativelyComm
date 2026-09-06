import { CheckCircle2, XCircle, Settings2 } from "lucide-react";
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
      <h3 className="font-display mt-4 text-xl font-medium leading-tight tracking-tight">
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
  { label: "Has search tags", channel: "Etsy", weight: 35, passed: false },
  { label: "SKU present", channel: "Amazon", weight: 25, passed: true },
  { label: "3+ product images", channel: "Amazon", weight: 30, passed: false },
];

export function FeatureStorySection() {
  return (
    <section id="features" className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeatureStory
          number="01"
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
      </div>
    </section>
  );
}
