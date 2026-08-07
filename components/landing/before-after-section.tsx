"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";

// Teal suede shoe on a styled peach backdrop — busy enough to read as
// "before", plain enough that the radial white mask reads as "after".
const SRC =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=1200&q=80";

const STEP = 4;

export function BeforeAfterSection() {
  const [position, setPosition] = useState(50);
  const draggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition((p) => Math.max(0, p - STEP));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition((p) => Math.min(100, p + STEP));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  }

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="See it work"
          title="Drag to see the cleanup."
          description="One-click background removal, powered by Remove.bg — no photo editor required."
        />

        <FadeIn delay={0.15} className="mx-auto mt-12 max-w-3xl">
          <div
            ref={containerRef}
            className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-2xl border border-border-strong bg-white card-shadow-lg"
            onMouseDown={(e) => {
              draggingRef.current = true;
              updateFromClientX(e.clientX);
            }}
            onMouseMove={(e) => {
              if (draggingRef.current) updateFromClientX(e.clientX);
            }}
            onMouseUp={() => {
              draggingRef.current = false;
            }}
            onMouseLeave={() => {
              draggingRef.current = false;
            }}
            onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
          >
            {/* After: background faded to white via a radial mask */}
            <div
              className="absolute inset-0"
              style={{
                maskImage:
                  "radial-gradient(circle at 48% 46%, black 42%, transparent 72%)",
                WebkitMaskImage:
                  "radial-gradient(circle at 48% 46%, black 42%, transparent 72%)",
              }}
            >
              <Image
                src={SRC}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>

            {/* Before: clipped to the slider position, sits on top. The inner
                wrapper is widened by the inverse of the clip percentage so
                the image itself never rescales, only what's visible does. */}
            <div
              className="absolute inset-0 overflow-hidden border-r border-white/70"
              style={{ width: `${position}%` }}
            >
              <div
                className="relative h-full"
                style={{ width: `${(100 / Math.max(position, 1)) * 100}%` }}
              >
                <Image
                  src={SRC}
                  alt="Product photo before and after background removal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            </div>

            <span className="pointer-events-none absolute bottom-4 left-4 rounded-md bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              Original
            </span>
            <span className="pointer-events-none absolute bottom-4 right-4 rounded-md bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              Background removed
            </span>

            <div
              role="slider"
              tabIndex={0}
              aria-label="Comparison slider: drag or use arrow keys to compare original and background-removed photo"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(position)}
              onKeyDown={handleKeyDown}
              className="absolute inset-y-0 z-10 flex w-8 -translate-x-1/2 cursor-col-resize items-center justify-center outline-none"
              style={{ left: `${position}%` }}
            >
              <div className="h-full w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" />
              <div className="absolute flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.25)] ring-2 ring-transparent focus-visible:ring-primary">
                <ArrowLeftRight className="h-4 w-4 text-foreground" />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
