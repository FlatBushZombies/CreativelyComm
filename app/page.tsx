import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustStrip } from "@/components/landing/trust-strip";
import { ProblemSection } from "@/components/landing/problem-section";
import { BeforeAfterSection } from "@/components/landing/before-after-section";
import { AIPhotoToolsSection } from "@/components/landing/ai-photo-tools-section";
import { FeatureStorySection } from "@/components/landing/features-section";
import { AICampaignSection } from "@/components/landing/ai-campaign-section";
import { OperationsSection } from "@/components/landing/operations-section";
import { SocialFormatsSection } from "@/components/landing/social-formats-section";
import { HardwareEcosystemSection } from "@/components/landing/hardware-ecosystem-section";
import { ProofSection } from "@/components/landing/proof-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";
import { FinalCtaSection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "CreativelyComm — Product Intelligence for Small Sellers",
  description:
    "Clean product photos, generate AI marketing campaigns, score listings against readiness rules, and export ready-to-list files to Shopify, Amazon, Etsy, and more — all from $19/month.",
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
        <AICampaignSection />
        <OperationsSection />
        <AIPhotoToolsSection />
        <SocialFormatsSection />
        <PricingSection />
        <ProofSection />
        <HardwareEcosystemSection />
        <FAQSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
