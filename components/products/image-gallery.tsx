"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  optimizedImages: string[];
  productName: string;
}

export function ImageGallery({ images, optimizedImages, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showOptimized, setShowOptimized] = useState(false);

  const displayImages = showOptimized ? optimizedImages : images;

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          src={displayImages[selectedIndex] || images[0]}
          alt={productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80"
              onClick={() =>
                setSelectedIndex((i) => (i === 0 ? displayImages.length - 1 : i - 1))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80"
              onClick={() =>
                setSelectedIndex((i) => (i === displayImages.length - 1 ? 0 : i + 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        {showOptimized && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
            <Sparkles className="h-3 w-3" />
            AI Optimized
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {displayImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
              selectedIndex === i ? "border-primary" : "border-transparent"
            )}
          >
            <Image src={img} alt="" fill className="object-cover" sizes="64px" />
          </button>
        ))}
      </div>

      <div className="flex rounded-lg border border-border p-1">
        <button
          onClick={() => { setShowOptimized(false); setSelectedIndex(0); }}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            !showOptimized ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          )}
        >
          Original
        </button>
        <button
          onClick={() => { setShowOptimized(true); setSelectedIndex(0); }}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            showOptimized ? "bg-accent text-accent-foreground" : "text-muted-foreground"
          )}
        >
          AI Optimized
        </button>
      </div>
    </div>
  );
}
