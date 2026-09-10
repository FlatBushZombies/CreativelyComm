import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { HeroMockup } from "@/components/landing/hero-mockup";

export function ProblemSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The problem"
          title="Small sellers waste time battling inconsistent product photos."
          description="Messy raw photos, mismatched crops, cluttered backgrounds — these are the #1 reasons listings get flagged by marketplaces or ignored by buyers. And every marketplace checks for something different. The real bottleneck isn't editing; it's capturing clean photos at the source."
        />

        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-4xl">
          <HeroMockup />
        </FadeIn>
      </div>
    </section>
  );
}
