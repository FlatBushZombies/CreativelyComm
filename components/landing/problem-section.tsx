import Image from "next/image";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";

export function ProblemSection() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <SectionHeading
            eyebrow="The problem"
            title={
              <>
                Small sellers waste time battling
                <br />
                inconsistent product photos.
              </>
            }
            description="Messy raw photos, mismatched crops, cluttered backgrounds — these are the #1 reasons listings get flagged by marketplaces or ignored by buyers. And every marketplace checks for something different. The real bottleneck isn't editing; it's capturing clean photos at the source."
          />

          <FadeIn direction="right" className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border-strong shadow-[0_24px_48px_-16px_rgb(22_22_15_/_0.28)]">
              <Image
                src="https://images.pexels.com/photos/6407632/pexels-photo-6407632.jpeg?auto=compress&cs=tinysrgb&w=900"
                alt="A seller scrolling through a grid of product photos on a laptop, checking each listing by hand"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-border-strong bg-card px-4 py-3 card-shadow-lg sm:-left-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">The old way</p>
              <p className="mt-0.5 text-sm font-medium">Checking listings one at a time, by hand</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
