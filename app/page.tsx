import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustStrip } from "@/components/landing/trust-strip";
import { ProblemSection } from "@/components/landing/problem-section";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { FeatureStorySection } from "@/components/landing/features-section";
import { AlsoIncludedSection } from "@/components/landing/also-included-section";
import { OperationsSection } from "@/components/landing/operations-section";
import { HardwareEcosystemSection } from "@/components/landing/hardware-ecosystem-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "CreativelyComm — Product Intelligence for Small Sellers",
  description:
    "Know exactly why a listing isn't ready — the Channel Readiness Engine scores every product against real marketplace rules, so you catch what's missing before it costs a sale. Start free — no credit card required.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <TrustStrip />
        <ProblemSection />
        <FeatureStorySection />
        <BeforeAfterSection />
        <AlsoIncludedSection />
        <OperationsSection />
        <PricingSection />
        <HardwareEcosystemSection />
        <FAQSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
