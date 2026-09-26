import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { AuditForm } from "./audit-form";

export const metadata: Metadata = {
  title: "Free Store Listing Audit — CreativelyComm",
  description:
    "Paste your Shopify store's address and see how ready your product listings are for Shopify, Amazon, Etsy, Google and more. No signup needed.",
};

export default function AuditPage() {
  return (
    <div className="min-h-screen">
      <LandingNav />
      <main className="hero-gradient">
        <div className="mx-auto max-w-3xl px-4 pb-24 pt-36 text-center sm:px-6 sm:pt-44">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Free listing audit</p>
          <h1 className="font-display mt-3 text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            How ready are your product listings?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Enter your Shopify store&apos;s address. We read the same public product feed anyone can see, then score every
            listing against common marketplace requirements: SKUs, photos, descriptions, tags and categories.
          </p>
          <div className="mt-8">
            <AuditForm />
          </div>
          <p className="mx-auto mt-6 max-w-lg text-xs text-muted-foreground">
            No signup, and nothing is changed on your store. We only read the public feed at /products.json and score up to
            your first 250 products. The rules are practical checks, not a copy of any marketplace&apos;s official policy.
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
