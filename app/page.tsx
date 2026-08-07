import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustStrip } from "@/components/landing/trust-strip";
import { ProblemSection } from "@/components/landing/problem-section";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { FeatureStorySection } from "@/components/landing/features-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { HardwareEcosystemSection } from "@/components/landing/hardware-ecosystem-section";
import { ProofSection } from "@/components/landing/proof-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "CreativelyComm — Product Intelligence for Small Sellers",
  description:
    "Turn raw product photos into marketplace wins. Clean photos, score listings against readiness rules, enable hardware capture systems, and export ready-to-list files to Shopify, Amazon, Etsy, and more.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <TrustStrip />
        <ProblemSection />
        <BeforeAfterSection />
        <FeatureStorySection />
        <WorkflowSection />
        <UseCasesSection />
        <HardwareEcosystemSection />
        <ProofSection />
        <PricingSection />
        <FAQSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
