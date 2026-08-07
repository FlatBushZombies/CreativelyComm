"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

export function FinalCtaSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary px-6 py-20 text-center sm:px-12 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.12),transparent)]" />
        <div className="relative">
          <FadeIn>
            <h2 className="font-display mx-auto max-w-2xl text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl">
              Your listings deserve better than a guess.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mx-auto mt-5 max-w-md text-lg text-primary-foreground/80">
              Start free, connect your first channel, and see your readiness
              score before you publish.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="mt-9 inline-block"
            >
              <Button size="lg" variant="secondary" asChild className="rounded-full px-7">
                <Link href="/signup">
                  Start creating
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
