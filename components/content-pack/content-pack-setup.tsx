"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { PLATFORM_SPECS, PLATFORM_CATEGORY_LABELS, type PlatformCategory } from "@/lib/platforms";
import { CREATIVE_TYPES, type CreativeTypeId } from "@/lib/creative-types";
import { analyzeProductImage, type ProductVisionInsight } from "@/lib/product-vision";
import { generateText } from "@/lib/puter";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

export interface TextOverlayInput {
  headline?: string;
  cta?: string;
  price?: string;
  badge?: string;
}

export interface ContentPackGenerationRequest {
  sourceImageUrl: string;
  platformIds: string[];
  creativeTypeIds: CreativeTypeId[];
  visionInsight: ProductVisionInsight | null;
  textOverlay: TextOverlayInput;
}

interface ContentPackSetupProps {
  product: Product;
  creating: boolean;
  error: string | null;
  onGenerate: (request: ContentPackGenerationRequest) => void;
}

const categories: PlatformCategory[] = ["social", "ads", "website"];

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

export function ContentPackSetup({ product, creating, error, onGenerate }: ContentPackSetupProps) {
  const images = product.optimizedImages.length > 0 ? product.optimizedImages : product.images;
  const hasCutout = product.optimizedImages.length > 0;
  const [sourceIndex, setSourceIndex] = useState(0);

  const [insight, setInsight] = useState<ProductVisionInsight | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [platforms, setPlatforms] = useState<Set<string>>(new Set(["instagram-square"]));
  const [creativeTypes, setCreativeTypes] = useState<Set<CreativeTypeId>>(new Set(["product"]));

  const [headline, setHeadline] = useState("");
  const [cta, setCta] = useState("");
  const [price, setPrice] = useState("");
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const sourceImage = images[Math.min(sourceIndex, images.length - 1)];
  const needsOverlay = Array.from(creativeTypes).some((id) => CREATIVE_TYPES.find((c) => c.id === id)?.allowsTextOverlay);
  const needsCutout = Array.from(creativeTypes).some((id) => id === "lifestyle") && !hasCutout;

  function togglePlatform(id: string) {
    setPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCreativeType(id: CreativeTypeId) {
    if (id === "lifestyle" && !hasCutout) return;
    setCreativeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAnalyze() {
    setAnalyzeError(null);
    setAnalyzing(true);
    try {
      const result = await analyzeProductImage(sourceImage);
      setInsight(result);
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : "Couldn't analyze this photo.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerateCopy() {
    setCopyError(null);
    setGeneratingCopy(true);
    try {
      const prompt = `Write short marketing copy for this product. Respond with ONLY a JSON object (no markdown fences): {"headline": "a short punchy headline, under 8 words", "cta": "a short call-to-action phrase, 2-4 words"}.

Product: ${product.name}
Description: ${product.description || "(none)"}
Category: ${product.category || "uncategorized"}
Price: $${product.price.toFixed(2)}`;
      const raw = await generateText(prompt, { temperature: 0.7 });
      const parsed = JSON.parse(stripCodeFences(raw)) as { headline?: string; cta?: string };
      if (parsed.headline) setHeadline(parsed.headline);
      if (parsed.cta) setCta(parsed.cta);
    } catch (err) {
      setCopyError(err instanceof Error ? err.message : "Couldn't generate copy right now.");
    } finally {
      setGeneratingCopy(false);
    }
  }

  function handleSubmit() {
    onGenerate({
      sourceImageUrl: sourceImage,
      platformIds: Array.from(platforms),
      creativeTypeIds: Array.from(creativeTypes),
      visionInsight: insight,
      textOverlay: {
        headline: headline.trim() || undefined,
        cta: cta.trim() || undefined,
        price: price.trim() || undefined,
      },
    });
  }

  const canSubmit = platforms.size > 0 && creativeTypes.size > 0 && !creating;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Source photo</CardTitle>
          <CardDescription>
            {hasCutout
              ? "Every variation is derived from this photo, so crops stay consistent."
              : "Remove this product's background first for smarter, product-aware cropping."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setSourceIndex(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                  i === sourceIndex ? "border-primary" : "border-transparent"
                )}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {insight ? "Re-analyze photo" : "Analyze photo with AI"}
          </Button>
          {analyzeError && <p className="text-xs text-red-600">{analyzeError}</p>}
          {insight && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="text-foreground">{insight.subjectDescription}</p>
              {insight.dominantColors.length > 0 && <p className="mt-1">Colors: {insight.dominantColors.join(", ")}</p>}
              {insight.notes && <p className="mt-1">{insight.notes}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">2. Platforms</CardTitle>
          <CardDescription>Choose every size you need — each becomes one generated asset.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {PLATFORM_CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_SPECS.filter((p) => p.category === category).map((spec) => (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => togglePlatform(spec.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                      platforms.has(spec.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <span className="block font-medium">{spec.label}</span>
                    <span className="block text-[10px] opacity-80">
                      {spec.width}×{spec.height}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">3. Creative type</CardTitle>
          <CardDescription>What each variation is for — not just its size.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {CREATIVE_TYPES.map((type) => {
              const disabled = type.id === "lifestyle" && !hasCutout;
              return (
                <button
                  key={type.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleCreativeType(type.id)}
                  className={cn(
                    "rounded-lg border p-3 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    creativeTypes.has(type.id)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <span className="block text-sm font-medium">{type.label}</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    {disabled ? "Remove a background first to use this" : type.description}
                  </span>
                </button>
              );
            })}
          </div>

          {needsOverlay && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overlay text</p>
                <Button variant="outline" size="sm" className="h-6 px-2 text-[11px]" onClick={handleGenerateCopy} disabled={generatingCopy}>
                  {generatingCopy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                  Generate copy
                </Button>
              </div>
              {copyError && <p className="text-xs text-red-600">{copyError}</p>}
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <Label htmlFor="headline" className="text-[11px]">Headline</Label>
                  <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <Label htmlFor="cta" className="text-[11px]">CTA</Label>
                  <Input id="cta" value={cta} onChange={(e) => setCta(e.target.value)} className="mt-1 h-8 text-xs" />
                </div>
                <div>
                  <Label htmlFor="price" className="text-[11px]">Price / offer</Label>
                  <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={`$${product.price.toFixed(2)}`} className="mt-1 h-8 text-xs" />
                </div>
              </div>
            </div>
          )}

          {needsCutout && (
            <p className="text-xs text-amber-600">Lifestyle is selected but this product has no background-removed photo yet — deselect it or remove a background first.</p>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleSubmit} disabled={!canSubmit} size="lg">
        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Generate content pack ({platforms.size * creativeTypes.size || 0} assets)
      </Button>
    </div>
  );
}
