import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CampaignObjective, CampaignChannel, CampaignStatus, CampaignContent } from "@/lib/campaign-types";

export type { CampaignObjective, CampaignChannel, CampaignStatus, CampaignContent };

export interface Campaign {
  id: string;
  productId: string | null;
  name: string;
  objective: CampaignObjective;
  channel: CampaignChannel;
  audience: string | null;
  tone: string | null;
  duration: string | null;
  offer: string | null;
  additionalInstructions: string | null;
  status: CampaignStatus;
  content: CampaignContent;
  generatedContent: CampaignContent | null;
  createdAt: string;
  updatedAt: string;
}

interface CampaignRow {
  id: string;
  product_id: string | null;
  name: string;
  objective: CampaignObjective;
  channel: CampaignChannel;
  audience: string | null;
  tone: string | null;
  duration: string | null;
  offer: string | null;
  additional_instructions: string | null;
  status: CampaignStatus;
  content: CampaignContent;
  generated_content: CampaignContent | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: CampaignRow): Campaign {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    objective: row.objective,
    channel: row.channel,
    audience: row.audience,
    tone: row.tone,
    duration: row.duration,
    offer: row.offer,
    additionalInstructions: row.additional_instructions,
    status: row.status,
    content: row.content ?? {},
    generatedContent: row.generated_content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateCampaignInput {
  productId: string;
  name: string;
  objective: CampaignObjective;
  channel: CampaignChannel;
  audience?: string;
  tone?: string;
  duration?: string;
  offer?: string;
  additionalInstructions?: string;
  createdBy?: string;
}

/** Creates a draft campaign. Caller must have already verified productId belongs to workspaceId. */
export async function createCampaign(workspaceId: string, input: CreateCampaignInput): Promise<Campaign> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      workspace_id: workspaceId,
      product_id: input.productId,
      name: input.name,
      objective: input.objective,
      channel: input.channel,
      audience: input.audience ?? null,
      tone: input.tone ?? null,
      duration: input.duration ?? null,
      offer: input.offer ?? null,
      additional_instructions: input.additionalInstructions ?? null,
      created_by: input.createdBy ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create campaign: ${error?.message}`);
  }

  return mapRow(data as CampaignRow);
}

export interface GetCampaignsFilter {
  status?: CampaignStatus;
}

export async function getCampaigns(workspaceId: string, filter: GetCampaignsFilter = {}): Promise<Campaign[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase.from("campaigns").select("*").eq("workspace_id", workspaceId);

  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load campaigns: ${error.message}`);
  }

  return (data as CampaignRow[]).map(mapRow);
}

export async function getCampaignById(id: string, workspaceId: string): Promise<Campaign | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load campaign: ${error.message}`);
  }

  return data ? mapRow(data as CampaignRow) : null;
}

/**
 * Replaces both `content` and `generated_content` -- used right after a
 * fresh AI generation (or a full "Regenerate entire campaign"), so the
 * user's previous edits are deliberately superseded, not merged.
 */
export async function saveGeneratedContent(
  id: string,
  workspaceId: string,
  content: CampaignContent
): Promise<Campaign> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .update({ content, generated_content: content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to save generated campaign: ${error?.message}`);
  }

  return mapRow(data as CampaignRow);
}

/** Patches `content` only -- used for inline manual edits and single-field regenerate/refine actions. generated_content is left untouched. */
export async function updateCampaignContent(
  id: string,
  workspaceId: string,
  content: CampaignContent
): Promise<Campaign> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update campaign: ${error?.message}`);
  }

  return mapRow(data as CampaignRow);
}

export interface UpdateCampaignSettingsInput {
  name?: string;
  objective?: CampaignObjective;
  channel?: CampaignChannel;
  audience?: string;
  tone?: string;
  duration?: string;
  offer?: string;
  additionalInstructions?: string;
}

export async function updateCampaignSettings(
  id: string,
  workspaceId: string,
  input: UpdateCampaignSettingsInput
): Promise<Campaign> {
  const supabase = getSupabaseServerClient();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) patch.name = input.name;
  if (input.objective !== undefined) patch.objective = input.objective;
  if (input.channel !== undefined) patch.channel = input.channel;
  if (input.audience !== undefined) patch.audience = input.audience;
  if (input.tone !== undefined) patch.tone = input.tone;
  if (input.duration !== undefined) patch.duration = input.duration;
  if (input.offer !== undefined) patch.offer = input.offer;
  if (input.additionalInstructions !== undefined) patch.additional_instructions = input.additionalInstructions;

  const { data, error } = await supabase
    .from("campaigns")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update campaign settings: ${error?.message}`);
  }

  return mapRow(data as CampaignRow);
}

export async function updateCampaignStatus(id: string, workspaceId: string, status: CampaignStatus): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("campaigns")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to update campaign status: ${error.message}`);
  }
}

export async function duplicateCampaign(id: string, workspaceId: string): Promise<Campaign> {
  const original = await getCampaignById(id, workspaceId);
  if (!original) {
    throw new Error("Campaign not found.");
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      workspace_id: workspaceId,
      product_id: original.productId,
      name: `${original.name} (copy)`,
      objective: original.objective,
      channel: original.channel,
      audience: original.audience,
      tone: original.tone,
      duration: original.duration,
      offer: original.offer,
      additional_instructions: original.additionalInstructions,
      status: "draft",
      content: original.content,
      generated_content: original.generatedContent,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to duplicate campaign: ${error?.message}`);
  }

  return mapRow(data as CampaignRow);
}

export async function deleteCampaign(id: string, workspaceId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("campaigns").delete().eq("id", id).eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to delete campaign: ${error.message}`);
  }
}
