import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { HeroMockup } from "@/components/landing/hero-mockup";

export function ProblemSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The launch gap"
          title="A promising store should not leave success to guesswork."
          description="Traffic and lost revenue tell you where to look, not what went wrong. CreatlyComm checks the details that can quietly hold a product back — missing disclosures, barcodes, image formats, or restricted claims — and turns them into a clear next move."
        />

        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-4xl">
          <HeroMockup />
        </FadeIn>
      </div>
    </section>
  );
}
