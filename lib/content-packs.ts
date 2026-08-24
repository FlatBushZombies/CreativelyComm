import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CreativeTypeId } from "@/lib/creative-types";
import type { ProductVisionInsight } from "@/lib/product-vision";

export type ContentPackStatus = "draft" | "generating" | "completed" | "failed";
export type AssetStatus = "queued" | "processing" | "completed" | "failed";

export interface ContentPack {
  id: string;
  productId: string;
  name: string;
  sourceImageUrl: string;
  visionInsight: ProductVisionInsight | null;
  status: ContentPackStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContentPackAsset {
  id: string;
  contentPackId: string;
  platformId: string;
  creativeType: CreativeTypeId;
  status: AssetStatus;
  imageUrl: string | null;
  width: number | null;
  height: number | null;
  errorMessage: string | null;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PackRow {
  id: string;
  product_id: string;
  name: string;
  source_image_url: string;
  vision_insight: ProductVisionInsight | null;
  status: ContentPackStatus;
  created_at: string;
  updated_at: string;
}

interface AssetRow {
  id: string;
  content_pack_id: string;
  platform_id: string;
  creative_type: CreativeTypeId;
  status: AssetStatus;
  image_url: string | null;
  width: number | null;
  height: number | null;
  error_message: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

function mapPack(row: PackRow): ContentPack {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    sourceImageUrl: row.source_image_url,
    visionInsight: row.vision_insight,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAsset(row: AssetRow): ContentPackAsset {
  return {
    id: row.id,
    contentPackId: row.content_pack_id,
    platformId: row.platform_id,
    creativeType: row.creative_type,
    status: row.status,
    imageUrl: row.image_url,
    width: row.width,
    height: row.height,
    errorMessage: row.error_message,
    approved: row.approved,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createContentPack(
  workspaceId: string,
  input: { productId: string; name: string; sourceImageUrl: string; createdBy?: string }
): Promise<ContentPack> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_packs")
    .insert({
      workspace_id: workspaceId,
      product_id: input.productId,
      name: input.name,
      source_image_url: input.sourceImageUrl,
      status: "draft",
      created_by: input.createdBy ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create content pack: ${error?.message}`);
  }

  return mapPack(data as PackRow);
}

/**
 * Bulk-inserts one queued asset row per platform x creative-type
 * combination up front -- this is what makes "leave and come back" real:
 * the rows exist with real queued status immediately, not just as
 * in-memory client state.
 */
export async function createContentPackAssets(
  workspaceId: string,
  contentPackId: string,
  combos: { platformId: string; creativeType: CreativeTypeId; width: number; height: number }[]
): Promise<ContentPackAsset[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_pack_assets")
    .insert(
      combos.map((c) => ({
        content_pack_id: contentPackId,
        workspace_id: workspaceId,
        platform_id: c.platformId,
        creative_type: c.creativeType,
        width: c.width,
        height: c.height,
        status: "queued",
      }))
    )
    .select();

  if (error || !data) {
    throw new Error(`Failed to queue content pack assets: ${error?.message}`);
  }

  await supabase.from("content_packs").update({ status: "generating", updated_at: new Date().toISOString() }).eq("id", contentPackId);

  return (data as AssetRow[]).map(mapAsset);
}

export async function getContentPackById(id: string, workspaceId: string): Promise<ContentPack | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_packs")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load content pack: ${error.message}`);
  }

  return data ? mapPack(data as PackRow) : null;
}

export async function getActiveContentPackForProduct(productId: string, workspaceId: string): Promise<ContentPack | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_packs")
    .select("*")
    .eq("product_id", productId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load content pack: ${error.message}`);
  }

  return data ? mapPack(data as PackRow) : null;
}

export async function getContentPackAssets(contentPackId: string, workspaceId: string): Promise<ContentPackAsset[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_pack_assets")
    .select("*")
    .eq("content_pack_id", contentPackId)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load content pack assets: ${error.message}`);
  }

  return (data as AssetRow[]).map(mapAsset);
}

export async function saveVisionInsight(
  contentPackId: string,
  workspaceId: string,
  insight: ProductVisionInsight
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("content_packs")
    .update({ vision_insight: insight, updated_at: new Date().toISOString() })
    .eq("id", contentPackId)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to save vision insight: ${error.message}`);
  }
}

export interface UpdateAssetStatusInput {
  status: AssetStatus;
  imageUrl?: string;
  errorMessage?: string | null;
}

/** Also rolls the parent pack's status to completed/failed once every asset is done -- checked here so every call site doesn't have to remember to. */
export async function updateAssetStatus(
  assetId: string,
  workspaceId: string,
  input: UpdateAssetStatusInput
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const patch: Record<string, unknown> = { status: input.status, updated_at: new Date().toISOString() };
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl;
  if (input.errorMessage !== undefined) patch.error_message = input.errorMessage;

  const { data: assetRow, error } = await supabase
    .from("content_pack_assets")
    .update(patch)
    .eq("id", assetId)
    .eq("workspace_id", workspaceId)
    .select("content_pack_id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update asset: ${error.message}`);
  }
  if (!assetRow) return;

  if (input.status === "completed" || input.status === "failed") {
    const { data: siblings } = await supabase
      .from("content_pack_assets")
      .select("status")
      .eq("content_pack_id", assetRow.content_pack_id);

    const allDone = (siblings ?? []).every((s) => s.status === "completed" || s.status === "failed");
    if (allDone) {
      const anyFailed = (siblings ?? []).some((s) => s.status === "failed");
      await supabase
        .from("content_packs")
        .update({ status: anyFailed ? "failed" : "completed", updated_at: new Date().toISOString() })
        .eq("id", assetRow.content_pack_id);
    }
  }
}

export async function retryAsset(assetId: string, workspaceId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("content_pack_assets")
    .update({ status: "queued", error_message: null, updated_at: new Date().toISOString() })
    .eq("id", assetId)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to retry asset: ${error.message}`);
  }
}

export async function setAssetApproved(assetId: string, workspaceId: string, approved: boolean): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("content_pack_assets")
    .update({ approved, updated_at: new Date().toISOString() })
    .eq("id", assetId)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to update asset: ${error.message}`);
  }
}

export async function deleteContentPack(id: string, workspaceId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("content_packs").delete().eq("id", id).eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to delete content pack: ${error.message}`);
  }
}
