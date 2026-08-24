"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, RefreshCw, Check, Archive, ImageOff } from "lucide-react";
import { loadImage, drawCover, drawContainCentered, drawTextBanner, slugifyFilename } from "@/lib/image-fit";
import { computeProductBounds, computeSmartOffset } from "@/lib/smart-crop";
import { generateLifestyleBackground } from "@/lib/puter";
import { getPlatformSpec } from "@/lib/platforms";
import { getCreativeTypeSpec } from "@/lib/creative-types";
import { downloadContentPackZip } from "@/lib/zip-export";
import {
  saveAssetResultAction,
  markAssetFailedAction,
  retryAssetAction,
  setAssetApprovedAction,
} from "@/app/(dashboard)/products/[id]/content-pack/actions";
import type { ContentPackAsset } from "@/lib/content-packs";
import type { TextOverlayInput } from "@/components/content-pack/content-pack-setup";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

interface ContentPackReviewProps {
  contentPackId: string;
  initialAssets: ContentPackAsset[];
  product: Product;
  sourceImageUrl: string;
  textOverlay: TextOverlayInput;
  autoStart: boolean;
}

const statusVariant: Record<ContentPackAsset["status"], "muted" | "warning" | "success" | "destructive"> = {
  queued: "muted",
  processing: "warning",
  completed: "success",
  failed: "destructive",
};

export function ContentPackReview({
  contentPackId,
  initialAssets,
  product,
  sourceImageUrl,
  textOverlay,
  autoStart,
}: ContentPackReviewProps) {
  const [assets, setAssets] = useState<ContentPackAsset[]>(initialAssets);
  const [running, setRunning] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const queuedCount = assets.filter((a) => a.status === "queued").length;
  const completedCount = assets.filter((a) => a.status === "completed").length;

  async function generateOneAsset(asset: ContentPackAsset): Promise<void> {
    setProcessingId(asset.id);
    try {
      const spec = getPlatformSpec(asset.platformId);
      const creativeSpec = getCreativeTypeSpec(asset.creativeType);
      if (!spec) throw new Error("Unknown platform.");

      const canvas = document.createElement("canvas");
      canvas.width = spec.width;
      canvas.height = spec.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Couldn't prepare the canvas.");

      if (creativeSpec.usesAIBackground) {
        const cutout = product.optimizedImages[0];
        if (!cutout) throw new Error("This product has no background-removed photo to place on a scene.");
        const scenePrompt = `${product.category || product.name}, professional product photography backdrop, empty surface, no objects, no people`;
        const [cutoutImg, background] = await Promise.all([
          loadImage(cutout),
          generateLifestyleBackground(scenePrompt),
        ]);
        drawCover(ctx, background, spec.width, spec.height);
        drawContainCentered(ctx, cutoutImg, spec.width, spec.height);
      } else {
        const img = await loadImage(sourceImageUrl);
        let offsetX = 0.5;
        let offsetY = 0.5;
        if (product.optimizedImages.length > 0) {
          const cutoutForBounds = await loadImage(product.optimizedImages[0]).catch(() => null);
          if (cutoutForBounds) {
            const bounds = computeProductBounds(cutoutForBounds);
            if (bounds) {
              const offset = computeSmartOffset(bounds, cutoutForBounds.naturalWidth, cutoutForBounds.naturalHeight, spec.width / spec.height);
              offsetX = offset.offsetX;
              offsetY = offset.offsetY;
            }
          }
        }
        drawCover(ctx, img, spec.width, spec.height, { offsetX, offsetY });
      }

      if (creativeSpec.allowsTextOverlay) {
        const line = [textOverlay.headline, textOverlay.price, textOverlay.cta].filter(Boolean).join("   ·   ");
        if (line) drawTextBanner(ctx, line, spec.width, spec.height, "bottom");
      }

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't export this image."))), "image/jpeg", 0.92);
      });

      const formData = new FormData();
      formData.append("image", blob, `${asset.id}.jpg`);
      formData.set("assetId", asset.id);
      formData.set("contentPackId", contentPackId);

      const result = await saveAssetResultAction(formData);
      if (result.error || !result.imageUrl) throw new Error(result.error || "Upload failed.");

      const savedUrl = result.imageUrl;
      setAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? { ...a, status: "completed", imageUrl: savedUrl } : a))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't generate this asset.";
      await markAssetFailedAction(asset.id, contentPackId, message);
      setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, status: "failed", errorMessage: message } : a)));
    } finally {
      setProcessingId(null);
    }
  }

  async function runGeneration() {
    setRunning(true);
    const pending = assets.filter((a) => a.status === "queued");
    for (const asset of pending) {
      await generateOneAsset(asset);
    }
    setRunning(false);
  }

  useEffect(() => {
    if (autoStart && !startedRef.current && queuedCount > 0) {
      startedRef.current = true;
      runGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  async function handleRetry(asset: ContentPackAsset) {
    await retryAssetAction(asset.id, contentPackId);
    setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, status: "queued", errorMessage: null } : a)));
    await generateOneAsset({ ...asset, status: "queued", errorMessage: null });
  }

  async function handleToggleApprove(asset: ContentPackAsset) {
    const nextApproved = !asset.approved;
    setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, approved: nextApproved } : a)));
    await setAssetApprovedAction(asset.id, contentPackId, nextApproved);
  }

  async function handleDownload(asset: ContentPackAsset) {
    if (!asset.imageUrl) return;
    const response = await fetch(asset.imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugifyFilename(product.name)}-${asset.platformId}-${asset.creativeType}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDownloadZip() {
    setZipError(null);
    setDownloadingZip(true);
    try {
      const completed = assets.filter((a): a is ContentPackAsset & { imageUrl: string } => a.status === "completed" && !!a.imageUrl);
      await downloadContentPackZip(completed, product.name);
    } catch {
      setZipError("Couldn't build the zip file. Try downloading assets individually.");
    } finally {
      setDownloadingZip(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Review &amp; export</CardTitle>
            <CardDescription>
              {completedCount} of {assets.length} generated
              {queuedCount > 0 && !running ? ` — ${queuedCount} still queued` : ""}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {queuedCount > 0 && (
              <Button variant="outline" size="sm" onClick={runGeneration} disabled={running}>
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {running ? "Generating…" : "Resume generation"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDownloadZip} disabled={completedCount === 0 || downloadingZip}>
              {downloadingZip ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Archive className="h-3.5 w-3.5" />}
              Download .zip
            </Button>
          </div>
        </CardHeader>
        {zipError && (
          <CardContent className="pt-0">
            <p className="text-sm text-red-600">{zipError}</p>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => {
          const spec = getPlatformSpec(asset.platformId);
          const creativeSpec = getCreativeTypeSpec(asset.creativeType);
          const isProcessing = processingId === asset.id;

          return (
            <Card key={asset.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {asset.status === "completed" && asset.imageUrl ? (
                  <Image src={asset.imageUrl} alt="" fill sizes="300px" className="object-cover" unoptimized />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageOff className="h-5 w-5" />}
                    <span className="text-xs">{isProcessing ? "Generating…" : asset.status}</span>
                  </div>
                )}
                {asset.approved && (
                  <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium">{spec?.label ?? asset.platformId}</p>
                  <Badge variant={statusVariant[asset.status]} className="capitalize">
                    {asset.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {spec ? `${spec.width}×${spec.height}` : ""} · {creativeSpec.label}
                </p>
                {asset.status === "failed" && asset.errorMessage && (
                  <p className="text-xs text-red-600">{asset.errorMessage}</p>
                )}
                <div className={cn("flex gap-1.5 pt-1", asset.status !== "completed" && asset.status !== "failed" && "opacity-50")}>
                  {asset.status === "completed" && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => handleDownload(asset)}>
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant={asset.approved ? "default" : "outline"}
                        className="h-7 flex-1 text-xs"
                        onClick={() => handleToggleApprove(asset)}
                      >
                        <Check className="h-3 w-3" />
                        {asset.approved ? "Approved" : "Approve"}
                      </Button>
                    </>
                  )}
                  {(asset.status === "completed" || asset.status === "failed") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={isProcessing}
                      onClick={() => handleRetry(asset)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
