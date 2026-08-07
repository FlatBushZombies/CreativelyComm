import Image from "next/image";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";

const messyPhotos = [
  {
    // smartwatch, grey studio backdrop
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    className: "top-0 left-4 h-40 w-32 -rotate-6 sm:h-48 sm:w-36",
  },
  {
    // leather handbag, dark reflective shop window
    src: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&q=80",
    className: "top-6 left-40 h-28 w-44 rotate-3 sm:top-8 sm:left-48 sm:h-32 sm:w-52",
  },
  {
    // ceramic cups, warm white counter
    src: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=80",
    className: "top-40 left-0 h-36 w-36 rotate-2 sm:top-48 sm:h-44 sm:w-44",
  },
  {
    // leather wallet, dark blurred backdrop
    src: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80",
    className: "top-32 left-44 h-44 w-32 -rotate-3 sm:top-40 sm:left-52 sm:h-52 sm:w-40",
  },
  {
    // multicolor sneakers, plain backdrop
    src: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500&q=80",
    className: "top-72 left-16 h-32 w-40 rotate-6 sm:top-80 sm:left-20 sm:h-36 sm:w-48",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
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
            direction="right"
            delay={0.15}
            className="relative mx-auto h-[26rem] w-full max-w-md lg:mx-0"
            aria-hidden="true"
          >
            {messyPhotos.map((photo, i) => (
              <div
                key={photo.src}
                className={`absolute overflow-hidden rounded-lg border border-border-strong bg-muted shadow-[0_10px_24px_-8px_rgb(22_22_15_/_0.18)] ${photo.className}`}
                style={{ zIndex: i }}
              >
                <Image src={photo.src} alt="" fill className="object-cover" sizes="220px" />
              </div>
            ))}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
