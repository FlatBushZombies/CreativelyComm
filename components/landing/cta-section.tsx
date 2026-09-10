"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

// Same source photo as the hero (components/landing/hero-section.tsx),
// cropped to a different focal point for variety across the two bands.
const CTA_IMAGE = "https://images.pexels.com/photos/7289725/pexels-photo-7289725.jpeg?auto=compress&cs=tinysrgb&w=1800";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <Image
        src={CTA_IMAGE}
        alt=""
        fill
        className="object-cover object-[20%_60%]"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-foreground/70 to-foreground/60" />

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <FadeIn>
          <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
            Your listings deserve better than a guess.
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mx-auto mt-3 max-w-md text-base text-white/80">
            Start free, connect your first channel, and see your readiness
            score before you publish.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="mt-7 inline-block"
          >
            <Button size="lg" className="rounded-full bg-white px-7 text-foreground hover:bg-white/90" asChild>
              <Link href="/signup">
                Start creating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
