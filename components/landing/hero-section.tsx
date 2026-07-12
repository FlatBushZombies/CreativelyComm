"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Upload,
  Wand2,
  Store,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/shared/fade-in";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Floating decorative shapes, purely ornamental */}
      <div className="pointer-events-none absolute left-[6%] top-[22%] hidden h-16 w-16 rotate-12 rounded-2xl bg-amber-200/50 blur-[2px] lg:block" />
      <div className="pointer-events-none absolute right-[8%] top-[14%] hidden h-10 w-10 -rotate-6 rounded-full bg-violet-200/60 lg:block" />
      <div className="pointer-events-none absolute bottom-[8%] left-[10%] hidden h-8 w-8 rounded-full bg-primary/15 lg:block" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <FadeIn className="relative mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
              <Sparkles className="h-3 w-3 text-primary" />
              Every product deserves a story worth sharing
            </Badge>

            <h1 className="font-display text-4xl font-medium tracking-tight sm:text-6xl lg:text-6xl xl:text-7xl">
              Where every product gets{" "}
              <span className="gradient-text italic">marketplace-ready</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground sm:text-xl leading-relaxed">
              CreativelyComm isn&apos;t another ecommerce platform — it&apos;s the workspace
              where products are created, refined, and prepared before they reach
              customers. Organize your library, check real per-channel readiness against
              rules you control, clean up photos, and export marketplace-ready files for
              Shopify, Amazon, Etsy, and 7+ platforms — then publish everywhere your
              customers already are.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                asChild
                className="w-full transition-all hover:-translate-y-0.5 hover:card-shadow-glow sm:w-auto"
              >
                <Link href="/signup">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full transition-all hover:-translate-y-0.5 sm:w-auto"
              >
                <Link href="#workflow">See how it works</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · Free to start
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="relative">
            {/* Soft glow + a second, rotated card peeking out for cinematic depth */}
            <div className="absolute inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-2xl" />
            <div className="absolute -right-3 -top-3 hidden h-full w-full rotate-3 rounded-2xl border border-border bg-card/60 sm:block" />

            <div className="relative rounded-2xl border border-border bg-card p-2 card-shadow-lg -rotate-1">
              <div className="rounded-lg bg-muted/50 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs text-muted-foreground">CreativelyComm Dashboard</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: Upload, label: "Upload", desc: "Drag & drop or import CSV" },
                    { icon: Wand2, label: "Optimize", desc: "Check readiness, clean photos" },
                    { icon: Store, label: "Publish", desc: "Export to 7+ platforms" },
                  ].map((step, i) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.15 }}
                      className="flex flex-col items-center rounded-lg bg-background p-4 text-center card-shadow"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-accent to-accent/30 shadow-[0_8px_20px_-8px_rgba(56,102,65,0.35)]">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="mt-2 text-sm font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&q=80",
                    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
                    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&q=80",
                    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&q=80",
                  ].map((src, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image src={src} alt="" fill className="object-cover" sizes="150px" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating accent badges -- decorative only, reusing existing on-page wording */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="absolute -left-6 top-10 hidden rotate-[-6deg] items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium card-shadow-lg sm:flex"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Readiness
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.05 }}
              className="absolute -bottom-5 right-2 hidden rotate-[4deg] items-center justify-center rounded-full bg-primary p-2.5 text-primary-foreground card-shadow-lg sm:flex"
            >
              <Layers className="h-4 w-4" />
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
