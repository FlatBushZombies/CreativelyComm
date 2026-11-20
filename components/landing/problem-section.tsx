import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { HeroMockup } from "@/components/landing/hero-mockup";

export function ProblemSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The beginner gap"
          title="Starting an ecommerce store should not feel like guesswork."
          description="You may see traffic, carts, or lost revenue — but not why. CreatlyComm checks whether a missing disclosure, GTIN, image format, or restricted claim is blocking the product, then shows what to fix next."
        />

        <FadeIn delay={0.1} className="mx-auto mt-12 max-w-4xl">
          <HeroMockup />
        </FadeIn>
      </div>
    </section>
  );
}
