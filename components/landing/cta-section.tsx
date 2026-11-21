"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

export function FinalCtaSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground px-6 py-16 text-center sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(56,102,65,0.35), transparent), radial-gradient(ellipse 50% 45% at 90% 100%, rgba(56,102,65,0.25), transparent)",
            }}
          />

          <div className="relative mx-auto max-w-2xl">
            <FadeIn>
              <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-white sm:text-4xl">
                Your next product launch can begin with a plan.
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mx-auto mt-3 max-w-md text-base text-white/70">
                Check a Shopify product, find what is holding it back, and know exactly what to improve before it reaches customers.
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
                    Start free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
