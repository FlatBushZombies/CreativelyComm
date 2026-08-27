"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is CreativelyComm another ecommerce platform?",
    answer:
      "No. CreativelyComm is the workspace where products are created, refined, and prepared before they reach customers. Connect it to a Shopify store you already run with two-way sync, or use the built-in branded storefront on its own.",
  },
  {
    question: "What's the difference between Free, Pro, and Enterprise?",
    answer:
      "Free is a 14-day trial of the core toolkit — background removal, campaign generation, and readiness scoring, capped at 25 products. Pro ($19/month) unlocks unlimited products, AI lifestyle scenes, social format fitting, multi-channel export, and team collaboration. Enterprise adds unlimited seats, SSO, custom readiness rules, and dedicated support — talk to us for pricing.",
  },
  {
    question: "Which platforms can I export to?",
    answer:
      "Shopify, Amazon, Etsy, Google Merchant, and 7+ more, each with a real readiness score checked against rules you control before you export.",
  },
  {
    question: "Can my whole team use one workspace?",
    answer:
      "Yes. Invite teammates with owner, admin, editor, or viewer roles so everyone works from the same product library instead of passing spreadsheets around.",
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No credit card required for the 14-day free trial — upgrade to Pro whenever you're ready.",
  },
  {
    question: "Can I connect Slack or QuickBooks?",
    answer:
      "Yes, bring your own Slack channel for real-time order alerts and your own QuickBooks account for automatic invoicing.",
  },
];

export function FAQSection() {
  // A Set of open question indices -- each row toggles independently, no
  // accordion package involved.
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <section id="faq" className="py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Questions, answered" description="Everything you need to know before you start." />

        <div className="mt-8 divide-y divide-border border-t border-border">
          {faqs.map((faq, index) => {
            const isOpen = openItems.has(index);
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="text-base font-medium sm:text-lg">{faq.question}</span>
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-transform duration-200",
                      isOpen && "rotate-90 border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
                    isOpen ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <p className="min-h-0 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
