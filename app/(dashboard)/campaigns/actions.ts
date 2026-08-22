"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProductById } from "@/lib/products";
import { logActivity } from "@/lib/activity";
import {
  createCampaign,
  getCampaignById,
  saveGeneratedContent,
  updateCampaignContent,
  updateCampaignSettings,
  updateCampaignStatus,
  duplicateCampaign,
  deleteCampaign,
  type CampaignContent,
  type CampaignObjective,
  type CampaignChannel,
  type CampaignStatus,
} from "@/lib/campaigns";

async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  return { session, workspace };
}

export interface CreateCampaignState {
  error?: string;
  campaignId?: string;
}

/**
 * Creates a draft campaign. productId comes from the client (the "Create AI
 * Campaign" button on a product page) but is never trusted at face value --
 * re-verified against this workspace's own products before anything is
 * written.
 */
export async function createCampaignAction(productId: string): Promise<CreateCampaignState> {
  const { session, workspace } = await requireSession();

  const product = await getProductById(productId, workspace.id);
  if (!product) {
    return { error: "Product not found." };
  }

  try {
    const campaign = await createCampaign(workspace.id, {
      productId: product.id,
      name: `${product.name} campaign`,
      objective: "sales",
      channel: "instagram",
      createdBy: session.user.id,
    });

    await logActivity(workspace.id, {
      type: "share",
      title: "AI campaign started",
      description: `A campaign draft was created for ${product.name}`,
      productName: product.name,
    });

    revalidatePath("/campaigns");
    return { campaignId: campaign.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't start a campaign for this product." };
  }
}

export interface SaveGeneratedContentState {
  error?: string;
}

/** Called right after a client-side AI generation (or full regenerate) completes -- replaces content wholesale. */
export async function saveGeneratedCampaignContentAction(
  campaignId: string,
  content: CampaignContent
): Promise<SaveGeneratedContentState> {
  const { workspace } = await requireSession();

  const existing = await getCampaignById(campaignId, workspace.id);
  if (!existing) {
    return { error: "Campaign not found." };
  }

  try {
    await saveGeneratedContent(campaignId, workspace.id, content);
    revalidatePath(`/campaigns/${campaignId}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save this campaign." };
  }
}

/** Inline manual edits and single-field refine actions -- patches content only. */
export async function updateCampaignContentAction(
  campaignId: string,
  content: CampaignContent
): Promise<SaveGeneratedContentState> {
  const { workspace } = await requireSession();

  const existing = await getCampaignById(campaignId, workspace.id);
  if (!existing) {
    return { error: "Campaign not found." };
  }

  try {
    await updateCampaignContent(campaignId, workspace.id, content);
    revalidatePath(`/campaigns/${campaignId}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save your changes." };
  }
}

export interface UpdateCampaignSettingsState {
  error?: string;
}

export async function updateCampaignSettingsAction(
  campaignId: string,
  input: {
    name?: string;
    objective?: CampaignObjective;
    channel?: CampaignChannel;
    audience?: string;
    tone?: string;
    duration?: string;
    offer?: string;
    additionalInstructions?: string;
  }
): Promise<UpdateCampaignSettingsState> {
  const { workspace } = await requireSession();

  const existing = await getCampaignById(campaignId, workspace.id);
  if (!existing) {
    return { error: "Campaign not found." };
  }

  try {
    await updateCampaignSettings(campaignId, workspace.id, input);
    revalidatePath(`/campaigns/${campaignId}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't save campaign settings." };
  }
}

export async function setCampaignStatusAction(formData: FormData) {
  const { workspace } = await requireSession();
  const campaignId = String(formData.get("campaignId") ?? "");
  const status = String(formData.get("status") ?? "") as CampaignStatus;
  if (!campaignId || !status) return;

  const existing = await getCampaignById(campaignId, workspace.id);
  if (!existing) return;

  await updateCampaignStatus(campaignId, workspace.id, status);
  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function duplicateCampaignAction(formData: FormData) {
  const { workspace } = await requireSession();
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!campaignId) return;

  const existing = await getCampaignById(campaignId, workspace.id);
  if (!existing) return;

  await duplicateCampaign(campaignId, workspace.id);
  revalidatePath("/campaigns");
}

export async function deleteCampaignAction(formData: FormData) {
  const { workspace } = await requireSession();
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!campaignId) return;

  const existing = await getCampaignById(campaignId, workspace.id);
  if (!existing) return;

  await deleteCampaign(campaignId, workspace.id);
  revalidatePath("/campaigns");
}
