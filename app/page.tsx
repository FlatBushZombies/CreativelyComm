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
import { ProofSection } from "@/components/landing/proof-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "CreativelyComm — Never publish a listing that gets rejected",
  description:
    "Score every product against real per-channel readiness rules, clean up photos in one click, and export to Shopify, Amazon, Etsy, and 7+ more.",
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
        <ProofSection />
        <PricingSection />
        <FAQSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
