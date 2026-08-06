import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** "center" for a single centered block (default), "split" for the asymmetric left-heading/right-paragraph row. */
  layout?: "center" | "split";
  className?: string;
}

/**
 * Every section H2 on this page shared the same hardcoded string
 * ("text-3xl font-medium tracking-tight sm:text-5xl") by copy-paste --
 * this is the one place that pattern lives now, so it can't drift.
 */
export function SectionHeading({ eyebrow, title, description, layout = "center", className }: SectionHeadingProps) {
  if (layout === "split") {
    return (
      <FadeIn className={cn("grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-12", className)}>
        <div>
          {eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
          )}
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">{title}</h2>
        </div>
        {description && <p className="text-lg text-muted-foreground lg:text-right">{description}</p>}
      </FadeIn>
    );
  }

  return (
    <FadeIn className={cn("mx-auto max-w-2xl text-center", className)}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">{title}</h2>
      {description && <p className="mt-4 text-lg text-muted-foreground">{description}</p>}
    </FadeIn>
  );
}
