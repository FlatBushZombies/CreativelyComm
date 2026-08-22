import Image from "next/image";
import { Sparkles, ArrowRight, Square } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { Badge } from "@/components/ui/badge";

export function AIPhotoToolsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="New: AI photo tools"
          title="Turn a plain product shot into a lifestyle scene."
          description="Once a background is removed, generate a real AI-designed scene behind it — or drop it onto a clean white background instead. Both are included in the $19/month plan, no extra editing tool required."
        />

        <FadeIn delay={0.1} className="mx-auto mt-14 max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-border-strong bg-card card-shadow-lg">
            <div className="grid items-center gap-0 sm:grid-cols-[1fr_auto_1fr]">
              <div className="relative aspect-square">
                <Image
                  src="https://images.pexels.com/photos/31012803/pexels-photo-31012803.jpeg?auto=compress&cs=tinysrgb&w=700"
                  alt="A plain product photo on a white background before an AI scene is generated"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
                <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
                  Plain cutout
                </span>
              </div>

              <div className="flex items-center justify-center px-4 py-6 sm:px-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_rgba(56,102,65,0.45)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground sm:rotate-0" />
                </div>
              </div>

              <div className="relative aspect-square">
                <Image
                  src="https://images.pexels.com/photos/29611647/pexels-photo-29611647.jpeg?auto=compress&cs=tinysrgb&w=700"
                  alt="The same product placed on an AI-generated marble countertop lifestyle scene"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  AI-generated scene
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 sm:px-7">
              <p className="text-xs text-muted-foreground">
                Describe a scene, generate it, and it&apos;s attached to the product — no design
                software needed.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Lifestyle backgrounds
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Square className="h-3 w-3" />
                  White background
                </Badge>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
