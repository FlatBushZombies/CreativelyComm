"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";

const faqs = [
	{
		question: "Is CreatlyComm another ecommerce platform?",
		answer:
			"No. It works with the Shopify store you already have and turns one product into a checked, measurable funnel. It helps you catch channel requirements, understand product-level behavior, and prepare listings for other channels.",
	},
	{
		question: "What does the starter check include?",
		answer:
			"It checks a product across key readiness areas such as required fields, GTINs or barcodes, images, descriptions, disclosures, and category rules. You get plain-language blockers and the next action for each one.",
	},
	{
		question: "Which platforms can I prepare for?",
		answer:
			"Shopify, Amazon, Etsy, TikTok Shop, Google Merchant, Meta Shops, and WooCommerce are part of the channel workflow. Availability and connector depth vary by plan.",
	},
	{
		question: "Is it designed for beginners?",
		answer:
			"Yes. CreatlyComm is positioned as a starter and check guide: it explains what is missing, why it matters, and what to fix before you spend money or publish a listing.",
	},
	{
		question: "Do I need a credit card to start?",
		answer:
			"No. You can begin with the free Shopify readiness check and explore the Thyme Leaf demo without adding a credit card.",
	},
	{
		question: "Does it track every product?",
		answer:
			"The product-funnel view is built around SKU-level events such as variant interest, ingredient or detail-tab views, bundle choices, checkout exits, and repeat purchases. These signals help you improve one product instead of reading only generic store totals.",
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
				<SectionHeading
					title="Questions, answered"
					description="Everything you need to know before you start."
				/>

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
									<span className="text-base font-medium sm:text-lg">
										{faq.question}
									</span>
									<span
										className={cn(
											"flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border transition-transform duration-200",
											isOpen &&
												"rotate-90 border-primary bg-primary text-primary-foreground"
										)}
									>
										{isOpen ? (
											<X className="h-4 w-4" />
										) : (
											<Plus className="h-4 w-4" />
										)}
									</span>
								</button>
								<div
									className={cn(
										"grid overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]",
										isOpen
											? "grid-rows-[1fr] pb-4 opacity-100"
											: "grid-rows-[0fr] opacity-0"
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
