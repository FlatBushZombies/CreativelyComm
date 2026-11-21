"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { SectionHeading } from "@/components/landing/section-heading";
import { cn } from "@/lib/utils";

const faqs = [
	{
		question: "Is CreatlyComm another ecommerce platform?",
		answer:
			"No. It works alongside your Shopify store, turning each product into a checked, measurable sales funnel. CreatlyComm helps you find listing blockers, understand shopper behavior, and prepare for additional channels.",
	},
	{
		question: "What does the starter check include?",
		answer:
			"The check covers the details that can stop a listing: required fields, barcodes, images, descriptions, disclosures, and category rules. You receive plain-language findings and the exact next action for each one.",
	},
	{
		question: "Which sales channels can I prepare for?",
		answer:
			"The workflow supports Shopify, Amazon, Etsy, TikTok Shop, Google, Meta Shops, and WooCommerce. Channel options and connection depth vary by plan.",
	},
	{
		question: "Is CreatlyComm easy to get started with?",
		answer:
			"Yes. It is designed to turn a complex launch process into a short sequence of checks and fixes, with clear priorities and practical guidance instead of a wall of analytics.",
	},
	{
		question: "Do I need a credit card to start?",
		answer:
			"No. Try the free Shopify check and explore the Thyme Leaf product demo without adding a credit card.",
	},
	{
		question: "Does it track every product?",
		answer:
			"Yes. The product-funnel view follows the moments that matter for each listing — variant interest, detail views, bundle choices, checkout exits, and repeat purchases — so you can improve specific products instead of guessing from store totals.",
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
