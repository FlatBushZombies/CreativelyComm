import Link from "next/link";
import Image from "next/image";
import { ArrowRight, PlayCircle } from "lucide-react";
import { SiShopify, SiEtsy } from "react-icons/si";
import { FaAmazon } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";

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

// A real small seller packing orders — chosen for the full-bleed photo bands
// (hero, mid-page CTA, footer) instead of generic/unrelated stock imagery.
// Verified live before use; see components/landing/cta-section.tsx and
// landing-footer.tsx for the other two crops of this same photo.
const HERO_IMAGE =
	"https://images.pexels.com/photos/7289725/pexels-photo-7289725.jpeg?auto=compress&cs=tinysrgb&w=1800";

export function HeroSection() {
	return (
		<section className="relative overflow-hidden">
			<div className="relative flex min-h-[620px] items-center overflow-hidden pt-24 pb-16 sm:min-h-[720px] sm:pt-28">
				<Image
					src={HERO_IMAGE}
					alt="A small business owner packing product orders at their desk"
					fill
					priority
					className="object-cover object-[70%_30%]"
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-foreground/75 via-foreground/60 to-foreground/85" />

				<div className="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
					<FadeIn>
						<p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
							Built for beginners building their first ecommerce store
						</p>
					</FadeIn>

					<FadeIn delay={0.05}>
						<h1 className="font-display mt-6 text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-6xl">
							Launch every product
							<br />
							<span className="font-accent text-white">with confidence.</span>
						</h1>
					</FadeIn>

					<FadeIn delay={0.1}>
						<p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
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
									className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm"
								>
									<Icon className="h-3.5 w-3.5 text-white" />
								</span>
							))}
							<span className="text-xs font-medium text-white/70">
								Shopify + 4 more channels
							</span>
						</div>
					</FadeIn>

					<FadeIn delay={0.15}>
						<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
							<Button
								size="lg"
								className="rounded-full bg-white px-6 text-foreground hover:bg-white/90"
								asChild
							>
								<Link href="/signup">
									Check your first product
									<ArrowRight className="h-4 w-4" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
								asChild
							>
								<Link href="#how-it-works">
									<PlayCircle className="h-4 w-4" />
									Explore the demo
								</Link>
							</Button>
						</div>
						<p className="mt-4 text-sm text-white/70">
							Free Shopify check · No credit card required
						</p>
					</FadeIn>
				</div>
			</div>

			{/* 3-column feature strip */}
			<div className="relative border-b border-border py-10 sm:py-14">
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
