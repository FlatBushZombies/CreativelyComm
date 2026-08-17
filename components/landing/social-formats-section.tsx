import Image from "next/image";
import { SiInstagram, SiPinterest, SiFacebook } from "react-icons/si";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";

const formats = [
  {
    icon: SiInstagram,
    title: "Square, lifestyle-ready.",
    description:
      "Every photo gets auto-fit to a 1080×1080 square with a reposition control, so the crop stays centered on the product instead of cutting it off.",
    photo:
      "https://images.pexels.com/photos/3993398/pexels-photo-3993398.jpeg?auto=compress&cs=tinysrgb&w=900",
    photoAlt: "Flat-lay lifestyle product photography styled for a square Instagram crop",
    panelLabel: "Instagram Feed",
    panel: (
      <div className="flex items-center justify-between text-xs text-white">
        <span className="font-medium">1080 × 1080</span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">Square crop</span>
      </div>
    ),
  },
  {
    icon: SiPinterest,
    title: "Vertical pins, with your headline.",
    description:
      "The same photo, reframed to Pinterest's 2:3 pin size, with an optional text overlay so the benefit is legible before anyone clicks through.",
    photo:
      "https://images.pexels.com/photos/27552012/pexels-photo-27552012.jpeg?auto=compress&cs=tinysrgb&w=900",
    photoAlt: "Someone browsing Pinterest on their phone",
    panelLabel: "Pinterest Pin",
    panel: (
      <div className="space-y-1 text-xs text-white">
        <span className="font-medium">1000 × 1500</span>
        <div className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] w-fit">+ Headline</div>
      </div>
    ),
  },
  {
    icon: SiFacebook,
    title: "Carousels that show every angle.",
    description:
      "Pick 3–5 photos from the same product, each auto-cropped to a matching square, and download the whole carousel set in one go.",
    photo:
      "https://images.pexels.com/photos/31643533/pexels-photo-31643533.jpeg?auto=compress&cs=tinysrgb&w=900",
    photoAlt: "A variety of product angles displayed side by side",
    panelLabel: "Facebook Carousel",
    panel: (
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[10px] font-medium text-white"
          >
            {n}
          </span>
        ))}
      </div>
    ),
  },
];

export function SocialFormatsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
            Now built in
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            One photo. Every platform&apos;s shape.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Instagram wants square. Pinterest wants vertical. Facebook wants a carousel. Fit your
            product photos to each, right from the product page — no design tool required.
          </p>
        </FadeIn>

        <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-3">
          {formats.map((format) => (
            <StaggerItem key={format.title} className="flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-border-strong">
                <Image
                  src={format.photo}
                  alt={format.photoAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

                <div className="absolute inset-x-4 top-4 rounded-xl border border-white/20 bg-black/30 p-3 backdrop-blur-md">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                    <format.icon className="h-3 w-3" />
                    {format.panelLabel}
                  </p>
                  {format.panel}
                </div>
              </div>

              <h3 className="mt-5 text-xl font-bold tracking-tight">{format.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {format.description}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
