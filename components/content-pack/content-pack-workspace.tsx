"use client";

import { useState } from "react";
import { ContentPackSetup, type ContentPackGenerationRequest, type TextOverlayInput } from "@/components/content-pack/content-pack-setup";
import { ContentPackReview } from "@/components/content-pack/content-pack-review";
import { createContentPackAction, saveVisionInsightAction } from "@/app/(dashboard)/products/[id]/content-pack/actions";
import type { Product } from "@/lib/products";
import type { ContentPack, ContentPackAsset } from "@/lib/content-packs";

interface ContentPackWorkspaceProps {
  product: Product;
  existingPack: ContentPack | null;
  existingAssets: ContentPackAsset[];
}

export function ContentPackWorkspace({ product, existingPack, existingAssets }: ContentPackWorkspaceProps) {
  const [pack, setPack] = useState(existingPack);
  const [assets, setAssets] = useState(existingAssets);
  const [sourceImageUrl, setSourceImageUrl] = useState(existingPack?.sourceImageUrl ?? "");
  const [textOverlay, setTextOverlay] = useState<TextOverlayInput>({});
  const [justCreated, setJustCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(request: ContentPackGenerationRequest) {
    setError(null);
    setCreating(true);
    try {
      const result = await createContentPackAction(product.id, request.sourceImageUrl, request.platformIds, request.creativeTypeIds);
      if (result.error || !result.contentPackId || !result.assets) {
        setError(result.error || "Couldn't start this content pack.");
        return;
      }
      if (request.visionInsight) {
        await saveVisionInsightAction(result.contentPackId, request.visionInsight);
      }
      setSourceImageUrl(request.sourceImageUrl);
      setTextOverlay(request.textOverlay);
      setJustCreated(true);
      setPack({
        id: result.contentPackId,
        productId: product.id,
        name: `${product.name} content pack`,
        sourceImageUrl: request.sourceImageUrl,
        visionInsight: request.visionInsight,
        status: "generating",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setAssets(result.assets);
    } finally {
      setCreating(false);
    }
  }

  if (!pack || assets.length === 0) {
    return <ContentPackSetup product={product} creating={creating} error={error} onGenerate={handleGenerate} />;
  }

  return (
    <ContentPackReview
      key={pack.id}
      contentPackId={pack.id}
      initialAssets={assets}
      product={product}
      sourceImageUrl={sourceImageUrl || pack.sourceImageUrl}
      textOverlay={textOverlay}
      autoStart={justCreated}
    />
  );
}
