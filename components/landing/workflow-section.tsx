"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Share2,
  Store,
  ShoppingBag,
  Package,
  Globe2,
  Languages,
  FileSpreadsheet,
} from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";

const exportChannels = [
  { label: "Shopify", icon: Store, className: "bg-emerald-500" },
  { label: "Amazon", icon: ShoppingBag, className: "bg-amber-500" },
  { label: "Etsy", icon: Package, className: "bg-orange-500" },
  { label: "Google Merchant", icon: Globe2, className: "bg-sky-500" },
];

const exportChecklist = [
  "Real, marketplace-ready files — not a generic CSV export",
  "One click generates every channel's format at once",
  "Re-export anytime as products change, no manual re-formatting",
];

export function WorkflowSection() {
  return (
    <section id="features" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Asymmetric heading row, matching the pattern above */}
        <FadeIn className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-12">
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-5xl">
            Every channel,
            <br />
            one product library
          </h2>
          <p className="text-lg text-muted-foreground lg:text-right">
            Stop maintaining separate spreadsheets per marketplace. Prepare a
            product once, then push it wherever it needs to sell.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Link
            href="/signup"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
          >
            Get Started
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </FadeIn>

        {/* One large full-width colored feature card */}
        <FadeIn delay={0.15} className="mt-10">
          <div className="grid overflow-hidden rounded-3xl bg-primary text-primary-foreground card-shadow-glow lg:grid-cols-2">
            <div className="flex flex-col items-start justify-center gap-3 p-8 sm:p-10">
              {exportChannels.map(({ label, icon: Icon, className }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-full bg-white/10 py-2 pl-2 pr-5"
                  style={{ marginLeft: `${i * 1.5}rem` }}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${className}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-full bg-white/5 py-2 pl-2 pr-5" style={{ marginLeft: "6rem" }}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Share2 className="h-4 w-4 text-white" />
                </span>
                <span className="text-sm font-medium">+7 more</span>
              </div>
            </div>

            <div className="flex flex-col justify-center border-t border-white/15 p-8 sm:p-10 lg:border-l lg:border-t-0">
              <h3 className="font-display text-2xl font-medium sm:text-3xl">
                Real multi-channel export
              </h3>
              <p className="mt-3 text-primary-foreground/80">
                Generate marketplace-ready feed files for every platform you
                sell on, all from one product library.
              </p>
              <ul className="mt-6 space-y-3">
                {exportChecklist.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        {/* Two smaller white cards side-by-side */}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FadeIn delay={0.2}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 card-shadow sm:p-8">
              <div className="flex items-center gap-2">
                {["EN", "ES", "DE", "FR"].map((lang, i) => (
                  <span
                    key={lang}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-accent text-xs font-semibold text-accent-foreground"
                    style={{ marginLeft: i === 0 ? 0 : "-0.5rem" }}
                  >
                    {lang}
                  </span>
                ))}
                <Languages className="ml-3 h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">Multi-language listings</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Translate product names and descriptions for cross-border
                marketplaces with DeepL, with a real version history behind
                every change.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 card-shadow sm:p-8">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex flex-1 flex-col gap-1.5">
                    {[0, 1, 2].map((cell) => (
                      <div
                        key={cell}
                        className="h-2.5 rounded-sm bg-accent"
                        style={{ opacity: 1 - (row + cell) * 0.12 }}
                      />
                    ))}
                  </div>
                ))}
                <FileSpreadsheet className="ml-2 h-5 w-5 shrink-0 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">CSV import & bulk editing</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Import your whole catalog from a spreadsheet, or bulk-edit
                prices, categories, and status right in the table.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
