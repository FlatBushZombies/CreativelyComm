import Link from "next/link";
import { Cpu, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";

// A power-user add-on, not a core pitch -- kept to one compact mention near
// the bottom of the page rather than a full section, per direct feedback
// that hardware was overshadowing the software product.
export function HardwareEcosystemSection() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-muted/30 px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">For power users:</span> multi-angle
                capture, barcode scanning, pack verification, and in-person checkout — all run on
                hardware you already own, no proprietary devices required.
              </p>
            </div>
            <Link
              href="/hardware"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              See hardware workflows
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
