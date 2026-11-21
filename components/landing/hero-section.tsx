import Link from "next/link";
import { ArrowRight, PlayCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { SiShopify, SiEtsy } from "react-icons/si";
import { FaAmazon } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { HeroMockup } from "@/components/landing/hero-mockup";

const featureStrip = [
	{
		title: "Check every listing",
		description:
			"Catch missing GTINs, restricted claims, and marketplace requirements before a listing goes live.",
	},
	{
		title: "See what drives a sale",
		description:
			"Follow each product from ad click to purchase and find the exact step shoppers leave.",
	},
	{
		title: "Launch beyond Shopify",
		description:
			"Prepare and export your product funnel across Amazon, TikTok Shop, Etsy, Google, and more.",
	},
];

export function HeroSection() {
	return (
		<section className="relative overflow-hidden">
			<div className="hero-gradient relative pt-32 pb-20 sm:pt-40 sm:pb-28">
				<div className="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
					<FadeIn>
						<p className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-foreground/70 card-shadow">
							Built for beginners building their first ecommerce store
						</p>
					</FadeIn>

					<FadeIn delay={0.05}>
						<h1 className="font-display mt-6 text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-6xl">
							Launch every product
							<br />
							<span className="font-accent text-primary">with confidence.</span>
						</h1>
					</FadeIn>

					<FadeIn delay={0.1}>
						<p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
							CreatlyComm is the beginner guide for ecommerce product funnels — check
							marketplace readiness, understand what shoppers do, and fix the next
							blocker before it costs a sale.
						</p>
					</FadeIn>

					<FadeIn delay={0.13}>
						<div className="mx-auto mt-6 flex items-center justify-center gap-2.5">
							{[SiShopify, FaAmazon, SiEtsy].map((Icon, i) => (
								<span
									key={i}
									className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card"
								>
									<Icon className="h-3.5 w-3.5 text-foreground/55" />
								</span>
							))}
							<span className="text-xs font-medium text-muted-foreground">
								Shopify + 4 more channels
							</span>
						</div>
					</FadeIn>

					<FadeIn delay={0.15}>
						<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
							<Button size="lg" className="rounded-full px-6" asChild>
								<Link href="/signup">
									Check your first product
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="rounded-full px-6"
								asChild
							>
								<Link href="#how-it-works">
									<PlayCircle className="h-4 w-4" />
									Watch the demo
								</Link>
							</Button>
						</div>
						<p className="mt-4 text-sm text-muted-foreground">
							Free Shopify check · No credit card required
						</p>
					</FadeIn>
				</div>

				<FadeIn
					delay={0.22}
					direction="none"
					className="relative mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8"
				>
					<div className="relative">
						<HeroMockup />

						<div className="absolute -top-6 -right-3 hidden w-44 rotate-3 rounded-xl border border-border-strong bg-card p-3 card-shadow-lg sm:block">
							<div className="flex items-center gap-1.5 text-primary">
								<TrendingUp className="h-3.5 w-3.5" />
								<span className="text-xs font-semibold">+18% this week</span>
							</div>
							<p className="mt-1 text-[11px] leading-snug text-muted-foreground">
								Listings marked sale-ready
							</p>
						</div>

						<div className="absolute -bottom-6 -left-4 hidden -rotate-2 items-center gap-2 rounded-xl border border-border-strong bg-card px-3 py-2.5 card-shadow-lg sm:flex">
							<CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
							<span className="text-xs font-medium">Amazon checks passed</span>
						</div>
					</div>
				</FadeIn>
			</div>

			{/* 3-column feature strip */}
			<div className="relative border-t border-b border-border bg-background py-10 sm:py-14">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<StaggerContainer className="grid gap-8 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
						{featureStrip.map((item) => (
							<StaggerItem
								key={item.title}
								className="pt-6 sm:px-8 sm:pt-0 first:sm:pl-0"
							>
								<p className="text-lg font-bold tracking-tight sm:text-xl">
									{item.title}
								</p>
								<p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-muted-foreground">
									{item.description}
								</p>
							</StaggerItem>
						))}
					</StaggerContainer>
				</div>
			</div>
		</section>
	);
}
