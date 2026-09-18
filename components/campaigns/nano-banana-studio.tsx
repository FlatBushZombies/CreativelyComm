"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Loader2, RefreshCw, Check, ImageOff } from "lucide-react";
import posthog from "posthog-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { generateCampaignImage } from "@/lib/puter";
import { saveCampaignImageAction } from "@/app/(dashboard)/campaigns/actions";

interface NanoBananaStudioProps {
  campaignId: string;
  productImage?: string;
  productName: string;
  onSaved: (imageUrl: string) => void;
}

const STARTER_PROMPTS = [
  "Studio product shot on a soft gradient background",
  "Lifestyle scene, natural light, on a wooden table",
  "Bold, colorful social-media-ready background",
];

/**
 * Nano Banana (Gemini 2.5 Flash Image) image generation and iterative
 * editing for a campaign, via lib/puter.ts's generateCampaignImage --
 * real, free, no API key required (Puter's "user pays" model, same as
 * campaign copy generation and Lifestyle Backgrounds elsewhere in this app).
 */
export function NanoBananaStudio({ campaignId, productImage, productName, onSaved }: NanoBananaStudioProps) {
  const [prompt, setPrompt] = useState("");
  const [useProductPhoto, setUseProductPhoto] = useState(Boolean(productImage));
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(refine: boolean) {
    if (!prompt.trim()) {
      setError("Describe what you want first.");
      return;
    }
    setError(null);
    setGenerating(true);
    setSaved(false);
    try {
      const inputImage = refine ? (resultImage ?? undefined) : useProductPhoto ? productImage : undefined;
      const generated = await generateCampaignImage(prompt.trim(), inputImage);
      setResultImage(generated);
      posthog.capture("campaign_image_generated", { campaign_id: campaignId, refined: refine });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate this image right now.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!resultImage) return;
    setSaving(true);
    setError(null);
    try {
      const result = await saveCampaignImageAction(campaignId, resultImage);
      if (result.error || !result.imageUrl) {
        setError(result.error || "Couldn't save this image.");
        return;
      }
      posthog.capture("campaign_image_saved", { campaign_id: campaignId });
      onSaved(result.imageUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Nano Banana Studio
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate and iteratively refine a campaign visual with Nano Banana (Gemini 2.5 Flash
          Image) — free via your own Puter account, no API key needed. The first generation may
          prompt you to sign into Puter.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe the image you want for ${productName}...`}
              rows={4}
            />
            <div className="flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
            {productImage && !resultImage && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={useProductPhoto}
                  onChange={(e) => setUseProductPhoto(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                Start from this product&apos;s existing photo
              </label>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="button" size="sm" onClick={() => handleGenerate(false)} disabled={generating}>
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {resultImage ? "Generate new" : "Generate"}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
              {resultImage ? (
                <Image src={resultImage} alt="Nano Banana result" fill className="object-cover" sizes="400px" unoptimized />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff className="h-6 w-6" />
                  <p className="text-xs">Your generated image will show up here</p>
                </div>
              )}
              {saved && (
                <Badge variant="success" className="absolute right-2 top-2">
                  <Check className="h-3 w-3" />
                  Saved
                </Badge>
              )}
            </div>
            {resultImage && (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerate(true)}
                  disabled={generating || !prompt.trim()}
                >
                  {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Refine further
                </Button>
                <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Use this in my campaign
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
