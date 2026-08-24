"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProductById } from "@/lib/products";
import { uploadContentPackAsset } from "@/lib/storage";
import {
  createContentPack,
  createContentPackAssets,
  getContentPackById,
  saveVisionInsight,
  updateAssetStatus,
  retryAsset,
  setAssetApproved,
  deleteContentPack,
  type ContentPackAsset,
} from "@/lib/content-packs";
import type { CreativeTypeId } from "@/lib/creative-types";
import type { ProductVisionInsight } from "@/lib/product-vision";
import { getPlatformSpec } from "@/lib/platforms";

async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  return { session, workspace };
}

export interface CreateContentPackState {
  error?: string;
  contentPackId?: string;
  assets?: ContentPackAsset[];
}

/**
 * Creates the pack + every queued asset row up front. productId is never
 * trusted at face value -- re-verified against this workspace's own
 * products before anything is written.
 */
export async function createContentPackAction(
  productId: string,
  sourceImageUrl: string,
  platformIds: string[],
  creativeTypeIds: CreativeTypeId[]
): Promise<CreateContentPackState> {
  const { session, workspace } = await requireSession();

  const product = await getProductById(productId, workspace.id);
  if (!product) {
    return { error: "Product not found." };
  }
  if (platformIds.length === 0 || creativeTypeIds.length === 0) {
    return { error: "Choose at least one platform and one creative type." };
  }

  try {
    const pack = await createContentPack(workspace.id, {
      productId: product.id,
      name: `${product.name} content pack`,
      sourceImageUrl,
      createdBy: session.user.id,
    });

    const combos: { platformId: string; creativeType: CreativeTypeId; width: number; height: number }[] = [];
    for (const platformId of platformIds) {
      const spec = getPlatformSpec(platformId);
      if (!spec) continue;
      for (const creativeType of creativeTypeIds) {
        combos.push({ platformId, creativeType, width: spec.width, height: spec.height });
      }
    }

    const assets = await createContentPackAssets(workspace.id, pack.id, combos);

    revalidatePath(`/products/${productId}/content-pack`);
    return { contentPackId: pack.id, assets };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't start a content pack for this product." };
  }
}

export interface SaveVisionInsightState {
  error?: string;
}

export async function saveVisionInsightAction(
  contentPackId: string,
  insight: ProductVisionInsight
): Promise<SaveVisionInsightState> {
  const { workspace } = await requireSession();

  const pack = await getContentPackById(contentPackId, workspace.id);
  if (!pack) {
    return { error: "Content pack not found." };
  }

  try {
    await saveVisionInsight(contentPackId, workspace.id, insight);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save this analysis." };
  }
}

export interface SaveAssetResultState {
  error?: string;
  imageUrl?: string;
}

/** Uploads a client-composited crop/overlay result and marks its asset row completed. */
export async function saveAssetResultAction(formData: FormData): Promise<SaveAssetResultState> {
  const { workspace } = await requireSession();

  const assetId = String(formData.get("assetId") ?? "");
  const contentPackId = String(formData.get("contentPackId") ?? "");
  const file = formData.get("image");

  if (!assetId || !contentPackId || !(file instanceof File)) {
    return { error: "Missing generated image." };
  }

  const pack = await getContentPackById(contentPackId, workspace.id);
  if (!pack) {
    return { error: "Content pack not found." };
  }

  try {
    const imageUrl = await uploadContentPackAsset(workspace.id, contentPackId, assetId, file);
    await updateAssetStatus(assetId, workspace.id, { status: "completed", imageUrl, errorMessage: null });
    revalidatePath(`/products/${pack.productId}/content-pack`);
    return { imageUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate this asset.";
    await updateAssetStatus(assetId, workspace.id, { status: "failed", errorMessage: message });
    return { error: message };
  }
}

export async function markAssetFailedAction(assetId: string, contentPackId: string, message: string): Promise<void> {
  const { workspace } = await requireSession();
  const pack = await getContentPackById(contentPackId, workspace.id);
  if (!pack) return;

  await updateAssetStatus(assetId, workspace.id, { status: "failed", errorMessage: message });
  revalidatePath(`/products/${pack.productId}/content-pack`);
}

export async function retryAssetAction(assetId: string, contentPackId: string): Promise<void> {
  const { workspace } = await requireSession();
  const pack = await getContentPackById(contentPackId, workspace.id);
  if (!pack) return;

  await retryAsset(assetId, workspace.id);
  revalidatePath(`/products/${pack.productId}/content-pack`);
}

export async function setAssetApprovedAction(assetId: string, contentPackId: string, approved: boolean): Promise<void> {
  const { workspace } = await requireSession();
  const pack = await getContentPackById(contentPackId, workspace.id);
  if (!pack) return;

  await setAssetApproved(assetId, workspace.id, approved);
  revalidatePath(`/products/${pack.productId}/content-pack`);
}

export async function deleteContentPackAction(formData: FormData): Promise<void> {
  const { workspace } = await requireSession();
  const contentPackId = String(formData.get("contentPackId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!contentPackId) return;

  const pack = await getContentPackById(contentPackId, workspace.id);
  if (!pack) return;

  await deleteContentPack(contentPackId, workspace.id);
  revalidatePath(`/products/${productId}/content-pack`);
}
