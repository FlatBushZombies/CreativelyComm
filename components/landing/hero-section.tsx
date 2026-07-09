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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/shared/fade-in";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="hero-gradient absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Know before you publish
          </Badge>

          <h1 className="font-display text-4xl font-medium tracking-tight sm:text-6xl lg:text-7xl">
            Turn products into{" "}
            <span className="gradient-text italic">marketplace-ready</span> listings
          </h1>

          <p className="mt-6 text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Upload your products once. Get a real readiness score for every channel,
            clean up your photos, and export marketplace-ready files for Shopify,
            Amazon, Etsy, and 7+ platforms — in minutes, not days.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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

        <FadeIn delay={0.2} className="mt-16 sm:mt-20">
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-border bg-card p-2 card-shadow-lg">
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
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
