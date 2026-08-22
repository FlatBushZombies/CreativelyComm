"use client";

import { useState, useRef, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Square as SquareIcon, Check } from "lucide-react";
import { loadImage, drawCover, drawContainCentered, canvasToDownload } from "@/lib/image-fit";
import { generateLifestyleBackground } from "@/lib/puter";
import { saveComposedImageAction } from "@/app/(dashboard)/products/[id]/actions";
import { cn } from "@/lib/utils";

const CANVAS_SIZE = { w: 1024, h: 1024 };

const scenePresets = [
  "Soft marble countertop, warm natural light",
  "Wooden table, cozy indoor light",
  "Minimalist studio backdrop, soft shadow",
  "Outdoor patio, bright daylight",
];

interface BackgroundComposerProps {
  productId: string;
  productName: string;
  cutoutImage: string;
  mode: "white" | "lifestyle";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Composites a Remove.bg product cutout onto either a flat white background
 * (instant, no AI) or a Puter.js-generated lifestyle scene (real AI image
 * generation, "user pays" -- the visitor's own free Puter account covers
 * the cost, no API key on our side). Compositing happens client-side via
 * Canvas; the flattened result is uploaded and attached to the product the
 * same way a Remove.bg result is.
 */
export function BackgroundComposer({
  productId,
  productName,
  cutoutImage,
  mode,
  open,
  onOpenChange,
}: BackgroundComposerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prompt, setPrompt] = useState(scenePresets[0]);
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function renderWhite() {
    setError(null);
    setSaved(false);
    setGenerating(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const cutout = await loadImage(cutoutImage);
      if (!canvas || !ctx) return;
      canvas.width = CANVAS_SIZE.w;
      canvas.height = CANVAS_SIZE.h;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_SIZE.w, CANVAS_SIZE.h);
      drawContainCentered(ctx, cutout, CANVAS_SIZE.w, CANVAS_SIZE.h);
      setReady(true);
    } catch {
      setError("Couldn't load this image.");
    } finally {
      setGenerating(false);
    }
  }

  async function renderLifestyle() {
    if (!prompt.trim()) {
      setError("Describe a scene first.");
      return;
    }
    setError(null);
    setSaved(false);
    setReady(false);
    setGenerating(true);
    try {
      const [cutout, background] = await Promise.all([
        loadImage(cutoutImage),
        generateLifestyleBackground(
          `${prompt.trim()}, professional product photography backdrop, empty surface, no objects, no people`
        ),
      ]);
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      canvas.width = CANVAS_SIZE.w;
      canvas.height = CANVAS_SIZE.h;
      drawCover(ctx, background, CANVAS_SIZE.w, CANVAS_SIZE.h);
      drawContainCentered(ctx, cutout, CANVAS_SIZE.w, CANVAS_SIZE.h);
      setReady(true);
    } catch {
      setError(
        "Couldn't generate a background — Puter may need you to sign in (check for a popup), or try again."
      );
    } finally {
      setGenerating(false);
    }
  }

  function handleGenerate() {
    if (mode === "white") renderWhite();
    else renderLifestyle();
  }

  async function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setError(null);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Couldn't export this image.");
          return;
        }
        const formData = new FormData();
        formData.append("image", blob, "composed.jpg");
        formData.set("productId", productId);
        formData.set("source", mode);
        startTransition(async () => {
          const result = await saveComposedImageAction(formData);
          if (result.error) {
            setError(result.error);
            return;
          }
          setSaved(true);
        });
      },
      "image/jpeg",
      0.92
    );
  }

  async function handleDownload() {
    if (!canvasRef.current) return;
    try {
      await canvasToDownload(canvasRef.current, `${productName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${mode}-bg.jpg`);
    } catch {
      setError("Couldn't export this image.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "white" ? <SquareIcon className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary" />}
            {mode === "white" ? "White Background" : "Lifestyle Background"}
          </DialogTitle>
          <DialogDescription>
            {mode === "white"
              ? "Places your background-removed photo on a clean, marketplace-ready white background."
              : "Generates a real scene with AI, then places your background-removed photo on top."}
          </DialogDescription>
        </DialogHeader>

        {mode === "lifestyle" && (
          <div className="space-y-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a scene, e.g. 'linen tablecloth, soft afternoon light'"
              rows={2}
            />
            <div className="flex flex-wrap gap-1.5">
              {scenePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPrompt(preset)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    prompt === preset
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent"
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Powered by Puter.js — free, no API key needed. A Puter login popup may appear the
              first time you generate.
            </p>
          </div>
        )}

        <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
          <canvas ref={canvasRef} className="h-full w-full" />
          {!ready && !generating && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Preview appears here
            </div>
          )}
          {generating && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && (
          <p className="flex items-center gap-1.5 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Added to this product&apos;s photos.
          </p>
        )}

        <DialogFooter className="flex-row flex-wrap gap-2 sm:justify-between">
          <Button variant="outline" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {ready ? "Regenerate" : "Generate"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={!ready}>
              Download
            </Button>
            <Button onClick={handleSave} disabled={!ready || isPending}>
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Add to product
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
