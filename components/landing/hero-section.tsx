"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Wand2,
  ShieldCheck,
  Share2,
  Store,
  ShoppingBag,
  Package,
  Globe2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/fade-in";
import { cn } from "@/lib/utils";

// The overlapping "avatar stack" mid-headline -- each circle stands in for a
// sales channel (storefront / marketplace / catalog / cross-border), not a
// literal person, since CreativelyComm readies products rather than people.
const channelAvatars = [
  { icon: Store, className: "bg-emerald-500" },
  { icon: ShoppingBag, className: "bg-amber-500" },
  { icon: Package, className: "bg-sky-500" },
  { icon: Globe2, className: "bg-violet-500" },
];

const productThumbnails = [
  "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&q=80",
  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&q=80",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&q=80",
];

const channelReadiness = [
  { label: "Shopify", pct: 100 },
  { label: "Amazon", pct: 94 },
  { label: "Etsy", pct: 78 },
];

const toolbarIcons = [Upload, Wand2, ShieldCheck, Share2];

export function HeroSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // No mailing-list backend exists yet -- capturing the email just carries
    // the visitor straight into the real signup flow instead of pretending
    // to submit somewhere.
    router.push("/signup");
  }

  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <FadeIn>
          <h1 className="font-display flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-4xl font-medium leading-tight tracking-tight sm:text-5xl lg:text-[3.75rem]">
            <span className="gradient-text italic">CreativelyComm</span>
            <span className="flex items-center -space-x-3" aria-hidden="true">
              {channelAvatars.map(({ icon: Icon, className }, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 border-background text-white shadow-sm sm:h-11 sm:w-11",
                    className
                  )}
                  style={{ zIndex: channelAvatars.length - i }}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              ))}
            </span>
            <span>readies every product for every channel it sells on</span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Not another ecommerce platform — the workspace where products are
            organized, checked, and cleaned up before they ever reach a
            customer. Real per-channel readiness scoring, one-click photo
            cleanup, and export to Shopify, Amazon, Etsy, and 7+ platforms.
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 sm:flex-row sm:gap-1.5 sm:rounded-full sm:border sm:border-border sm:bg-card sm:p-1.5 sm:card-shadow"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Work email"
              aria-label="Work email"
              className="h-11 w-full rounded-full border-border bg-card sm:h-10 sm:flex-1 sm:border-0 sm:bg-transparent sm:shadow-none sm:focus-visible:ring-0 sm:focus-visible:ring-offset-0"
            />
            <Button type="submit" size="lg" className="w-full rounded-full sm:w-auto">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Free to start ·{" "}
            <Link
              href="#workflow"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              see how it works
            </Link>
          </p>
        </FadeIn>

        <FadeIn delay={0.3} className="relative mx-auto mt-20 max-w-4xl">
          {/* Floating card breaking out on the left -- peeking from behind the main frame */}
          <motion.div
            initial={{ opacity: 0, x: -16, rotate: -10 }}
            whileInView={{ opacity: 1, x: 0, rotate: -6 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="absolute -left-4 top-8 z-20 hidden w-48 rounded-2xl border border-border bg-card p-4 text-left card-shadow-lg sm:-left-10 sm:block lg:-left-16"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </span>
              <span className="text-xs font-semibold">Readiness</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-2xl font-medium">94%</span>
              <span className="text-xs text-muted-foreground">ready for Amazon</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[94%] rounded-full bg-primary" />
            </div>
          </motion.div>

          {/* Floating card breaking out on the right -- a small sync notification */}
          <motion.div
            initial={{ opacity: 0, x: 16, y: 8, rotate: 10 }}
            whileInView={{ opacity: 1, x: 0, y: 0, rotate: 4 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="absolute -right-3 bottom-14 z-20 hidden w-52 rounded-2xl rounded-bl-sm border border-border bg-card p-4 text-left card-shadow-lg sm:-right-8 sm:block lg:-right-12"
          >
            <div className="flex items-start gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <RefreshCw className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs leading-relaxed">
                <span className="font-semibold">Synced to Shopify</span> — stock
                updated on 12 listings
              </p>
            </div>
          </motion.div>

          {/* Main dark workspace mockup */}
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0e1a10] p-6 text-left card-shadow-lg sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.08),transparent)]" />

            <div className="relative flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
              <span className="ml-2 text-xs text-white/50">CreativelyComm workspace</span>
            </div>

            <div className="relative mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:gap-6">
              <div className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm font-medium text-white">Artisan Ceramic Mug</p>
                <p className="mt-1 text-xs text-white/50">4 photos · 3 channels selected</p>
                <div className="mt-4 space-y-3">
                  {channelReadiness.map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>{row.label}</span>
                        <span>{row.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* thumbnail grid along the right edge */}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:w-28">
                {productThumbnails.map((src, i) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* control-icon row along the bottom */}
            <div className="relative mt-6 flex items-center justify-center gap-3 border-t border-white/10 pt-5">
              {toolbarIcons.map((Icon, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                    i === 2 ? "bg-primary text-white" : "bg-white/10 text-white/70"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
