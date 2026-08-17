"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2, Images } from "lucide-react";
import { SiInstagram, SiPinterest, SiFacebook } from "react-icons/si";
import { cn } from "@/lib/utils";
import {
  loadImage,
  drawCover,
  drawTextBanner,
  canvasToDownload,
  croppableAxis,
  slugifyFilename,
} from "@/lib/image-fit";

const INSTAGRAM_SIZE = { w: 1080, h: 1080 };
const PINTEREST_SIZE = { w: 1000, h: 1500 };
const FACEBOOK_SIZE = { w: 1080, h: 1080 };

interface SocialFormatStudioProps {
  images: string[];
  productName: string;
}

/**
 * Fits a product's existing photos into each platform's recommended crop —
 * entirely client-side via Canvas, no fabricated preview. Real cover-fit
 * cropping, a real pan control, real text compositing, and a real browser
 * download per platform.
 */
export function SocialFormatStudio({ images, productName }: SocialFormatStudioProps) {
  const [sourceIndex, setSourceIndex] = useState(0);

  if (images.length === 0) return null;

  const sourceImage = images[Math.min(sourceIndex, images.length - 1)];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Social Media Formats</CardTitle>
        <CardDescription>
          Fit this product&apos;s photos to what each platform actually wants — no extra editing
          tools required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {images.length > 1 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Source photo</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceIndex(i)}
                  className={cn(
                    "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2",
                    i === sourceIndex ? "border-primary" : "border-transparent"
                  )}
                >
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <InstagramCard sourceImage={sourceImage} productName={productName} />
          <PinterestCard sourceImage={sourceImage} productName={productName} />
          <FacebookCarouselCard images={images} productName={productName} />
        </div>
      </CardContent>
    </Card>
  );
}

function InstagramCard({ sourceImage, productName }: { sourceImage: string; productName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [offset, setOffset] = useState(50);
  const [axis, setAxis] = useState<"x" | "y" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  function render(offsetPct: number, axisOverride?: "x" | "y" | null) {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !img || !ctx) return;
    const useAxis = axisOverride !== undefined ? axisOverride : axis;
    canvas.width = INSTAGRAM_SIZE.w;
    canvas.height = INSTAGRAM_SIZE.h;
    drawCover(ctx, img, INSTAGRAM_SIZE.w, INSTAGRAM_SIZE.h, {
      offsetX: useAxis === "x" ? offsetPct / 100 : 0.5,
      offsetY: useAxis === "y" ? offsetPct / 100 : 0.5,
    });
  }

  useEffect(() => {
    let cancelled = false;
    loadImage(sourceImage)
      .then((img) => {
        if (cancelled) return;
        setError(null);
        imgRef.current = img;
        const nextAxis = croppableAxis(img, INSTAGRAM_SIZE.w, INSTAGRAM_SIZE.h);
        setAxis(nextAxis);
        setOffset(50);
        render(50, nextAxis);
      })
      .catch(() => !cancelled && setError("Couldn't load this image."));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceImage]);

  async function handleDownload() {
    if (!canvasRef.current) return;
    setDownloading(true);
    setError(null);
    try {
      await canvasToDownload(canvasRef.current, `${slugifyFilename(productName)}-instagram-square.jpg`);
    } catch {
      setError("Couldn't export this image.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SiInstagram className="h-4 w-4 text-primary" />
        Instagram Feed
      </div>
      <p className="text-xs text-muted-foreground">
        Square crop, lifestyle framing — center the product with breathing room around it.
      </p>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      {axis && (
        <input
          type="range"
          min={0}
          max={100}
          value={offset}
          onChange={(e) => {
            const value = Number(e.target.value);
            setOffset(value);
            render(value);
          }}
          className="w-full accent-primary"
          aria-label="Reposition crop"
        />
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button size="sm" variant="outline" className="w-full" onClick={handleDownload} disabled={downloading || !!error}>
        {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Download 1080×1080
      </Button>
    </div>
  );
}

function PinterestCard({ sourceImage, productName }: { sourceImage: string; productName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [offset, setOffset] = useState(50);
  const [axis, setAxis] = useState<"x" | "y" | null>(null);
  const [text, setText] = useState("");
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  function render(offsetPct: number, overlayText: string, overlayPosition: "top" | "bottom", axisOverride?: "x" | "y" | null) {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !img || !ctx) return;
    const useAxis = axisOverride !== undefined ? axisOverride : axis;
    canvas.width = PINTEREST_SIZE.w;
    canvas.height = PINTEREST_SIZE.h;
    drawCover(ctx, img, PINTEREST_SIZE.w, PINTEREST_SIZE.h, {
      offsetX: useAxis === "x" ? offsetPct / 100 : 0.5,
      offsetY: useAxis === "y" ? offsetPct / 100 : 0.5,
    });
    drawTextBanner(ctx, overlayText, PINTEREST_SIZE.w, PINTEREST_SIZE.h, overlayPosition);
  }

  useEffect(() => {
    let cancelled = false;
    loadImage(sourceImage)
      .then((img) => {
        if (cancelled) return;
        setError(null);
        imgRef.current = img;
        const nextAxis = croppableAxis(img, PINTEREST_SIZE.w, PINTEREST_SIZE.h);
        setAxis(nextAxis);
        setOffset(50);
        render(50, text, position, nextAxis);
      })
      .catch(() => !cancelled && setError("Couldn't load this image."));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceImage]);

  async function handleDownload() {
    if (!canvasRef.current) return;
    setDownloading(true);
    setError(null);
    try {
      await canvasToDownload(canvasRef.current, `${slugifyFilename(productName)}-pinterest-pin.jpg`);
    } catch {
      setError("Couldn't export this image.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SiPinterest className="h-4 w-4 text-primary" />
        Pinterest Pin
      </div>
      <p className="text-xs text-muted-foreground">
        Vertical pin with an optional text overlay — a short, benefit-driven headline works best.
      </p>
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[180px] overflow-hidden rounded-lg border border-border bg-muted">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
      {axis && (
        <input
          type="range"
          min={0}
          max={100}
          value={offset}
          onChange={(e) => {
            const value = Number(e.target.value);
            setOffset(value);
            render(value, text, position);
          }}
          className="w-full accent-primary"
          aria-label="Reposition crop"
        />
      )}
      <Textarea
        placeholder="Add a headline (optional)"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          render(offset, e.target.value, position);
        }}
        rows={2}
        className="text-xs"
      />
      <div className="flex rounded-lg border border-border p-1 text-xs">
        {(["top", "bottom"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPosition(p);
              render(offset, text, p);
            }}
            className={cn(
              "flex-1 rounded-md py-1.5 font-medium capitalize transition-colors",
              position === p ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            Text {p}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button size="sm" variant="outline" className="w-full" onClick={handleDownload} disabled={downloading || !!error}>
        {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Download 1000×1500
      </Button>
    </div>
  );
}

function FacebookCarouselCard({ images, productName }: { images: string[]; productName: string }) {
  const [selected, setSelected] = useState<boolean[]>(() => images.map((_, i) => i < 4));
  const [loadedImages, setLoadedImages] = useState<Record<number, HTMLImageElement>>({});
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    let cancelled = false;
    images.forEach((src, i) => {
      loadImage(src)
        .then((img) => {
          if (cancelled) return;
          setLoadedImages((prev) => ({ ...prev, [i]: img }));
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
    };
  }, [images]);

  useEffect(() => {
    Object.entries(loadedImages).forEach(([idxStr, img]) => {
      const idx = Number(idxStr);
      const canvas = canvasRefs.current.get(idx);
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      canvas.width = FACEBOOK_SIZE.w;
      canvas.height = FACEBOOK_SIZE.h;
      drawCover(ctx, img, FACEBOOK_SIZE.w, FACEBOOK_SIZE.h);
    });
  }, [loadedImages]);

  const selectedIndices = selected.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);

  async function handleDownloadAll() {
    setDownloading(true);
    setError(null);
    try {
      for (const idx of selectedIndices) {
        const canvas = canvasRefs.current.get(idx);
        if (!canvas) continue;
        await canvasToDownload(canvas, `${slugifyFilename(productName)}-facebook-carousel-${idx + 1}.jpg`);
      }
    } catch {
      setError("Couldn't export one or more images.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <SiFacebook className="h-4 w-4 text-primary" />
        Facebook Carousel
      </div>
      <p className="text-xs text-muted-foreground">
        Pick 3–5 photos that show different angles — carousels reward variety, not repetition.
      </p>
      <div className="flex flex-wrap gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
              selected[i] ? "border-primary" : "border-transparent opacity-50"
            )}
          >
            <canvas
              ref={(el) => {
                if (el) canvasRefs.current.set(i, el);
                else canvasRefs.current.delete(i);
              }}
              className="h-full w-full object-cover"
            />
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-[10px] text-white">
              {i + 1}
            </span>
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={handleDownloadAll}
        disabled={downloading || selectedIndices.length === 0}
      >
        {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Images className="h-3.5 w-3.5" />}
        Download {selectedIndices.length} slide{selectedIndices.length === 1 ? "" : "s"}
      </Button>
    </div>
  );
}
