import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { EfficiencySection } from "@/components/landing/features-section";
import { ConversationSection } from "@/components/landing/conversation-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { DevicePromoSection } from "@/components/landing/cta-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FAQSection } from "@/components/landing/faq-section";

export const metadata: Metadata = {
  title: "CreativelyComm — AI-Powered Product Marketing Platform",
  description:
    "Upload products once, optimize images with AI, build a storefront, and export to every major ecommerce platform.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main>
        <HeroSection />
        <EfficiencySection />
        <ConversationSection />
        <WorkflowSection />
        <DevicePromoSection />
        <PricingSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
}
