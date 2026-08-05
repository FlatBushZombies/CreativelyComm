"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wifi, Battery, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";

const storefrontTiles = [
  "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=200&q=80",
  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&q=80",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&q=80",
];

// The reference's device band promotes a native app with store badges.
// CreativelyComm doesn't have one, so this promotes the real thing instead:
// the branded public storefront every workspace already gets, previewed on
// a phone frame instead of a fabricated app-store download.
export function DevicePromoSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[#20401f] card-shadow-glow">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.12),transparent)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

            <div className="relative grid items-center gap-12 px-8 py-16 sm:px-12 lg:grid-cols-2 lg:gap-16 lg:px-16">
              <div className="text-center lg:text-left">
                <h2 className="font-display text-3xl font-medium text-white sm:text-5xl">
                  Your storefront, ready on any screen
                </h2>
                <p className="mx-auto mt-4 max-w-md text-lg text-primary-foreground/80 lg:mx-0">
                  Every workspace gets a branded storefront out of the box —
                  share a link, or embed it directly on your own site. No app
                  to install, no app store to wait on.
                </p>
                <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" variant="secondary" asChild className="w-full rounded-full sm:w-auto">
                      <Link href="/signup">
                        Start free
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="w-full rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white sm:w-auto"
                    >
                      <Link href="#workflow">See how it works</Link>
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Phone-shaped device mockup previewing the branded storefront */}
              <FadeIn direction="left" delay={0.15} className="mx-auto w-full max-w-[240px]">
                <div className="rounded-[2.25rem] border-[6px] border-white/20 bg-[#0e1a10] p-2 card-shadow-lg">
                  <div className="flex items-center justify-between px-2 pb-1.5 pt-1 text-white/70">
                    <span className="text-[10px] font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <Signal className="h-3 w-3" />
                      <Wifi className="h-3 w-3" />
                      <Battery className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-[1.5rem] bg-white">
                    <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2.5">
                      <div className="h-5 w-5 rounded-md bg-primary" />
                      <div className="h-2 w-16 rounded-full bg-muted" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-2">
                      {storefrontTiles.map((src) => (
                        <div
                          key={src}
                          className="aspect-square rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${src})` }}
                        />
                      ))}
                    </div>
                    <div className="space-y-1.5 px-3 pb-3">
                      <div className="h-2 w-3/4 rounded-full bg-muted" />
                      <div className="h-2 w-1/2 rounded-full bg-muted" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
