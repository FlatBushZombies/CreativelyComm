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
    question: "What's included in the $19/month plan?",
    answer:
      "Everything — it's a single plan with no tiers. The Channel Readiness Engine, one-click background removal, multi-channel export, team collaboration, CSV import, customizable readiness rules, and API access are all included.",
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
    answer: "No credit card required — you can start free and upgrade whenever you're ready.",
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
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Questions, answered" description="Everything you need to know before you start." />

        <div className="mt-12 divide-y divide-border border-t border-border">
          {faqs.map((faq, index) => {
            const isOpen = openItems.has(index);
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
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
                    isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
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
