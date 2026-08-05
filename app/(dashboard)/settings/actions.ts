"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace, updateWorkspaceBranding } from "@/lib/workspace";
import { inviteMember, removeMember, getMemberRole, type WorkspaceRole } from "@/lib/team";
import { logActivity } from "@/lib/activity";
import { createApiKey, revokeApiKey, type ApiKey } from "@/lib/api-keys";
import { createVendor, archiveVendor, inviteVendorUser } from "@/lib/vendors";
import { regenerateFeedToken } from "@/lib/workspace";
import { connectShopify, disconnectShopify } from "@/lib/integrations/shopify";
import { connectSlack, disconnectSlack, notifySlack } from "@/lib/integrations/slack";
import { disconnectIntegration, type IntegrationProvider } from "@/lib/integrations/store";

async function requireManagerRole() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const role = await getMemberRole(workspace.id, session.user.id);

  if (role !== "owner" && role !== "admin") {
    throw new Error("Only workspace owners and admins can manage the team.");
  }

  return workspace;
}

export async function inviteTeamMember(formData: FormData) {
  const workspace = await requireManagerRole();

  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "viewer") as WorkspaceRole;

  if (!email) return;

  await inviteMember(workspace.id, email, role);

  await logActivity(workspace.id, {
    type: "share",
    title: "Teammate invited",
    description: `${email} was invited as ${role}`,
  });

  revalidatePath("/settings");
}

export async function removeTeamMember(formData: FormData) {
  await requireManagerRole();

  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) return;

  await removeMember(memberId);
  revalidatePath("/settings");
}

export async function saveBrandingAction(formData: FormData) {
  const workspace = await requireManagerRole();

  const storeName = String(formData.get("storeName") ?? "").trim();
  const storeTagline = String(formData.get("storeTagline") ?? "").trim();
  const brandColor = String(formData.get("brandColor") ?? "#386641").trim();
  const hideBranding = formData.get("hideBranding") === "on";

  await updateWorkspaceBranding(workspace.id, { storeName, storeTagline, brandColor, hideBranding });
  revalidatePath("/settings");
  revalidatePath("/storefront");
  revalidatePath(`/store/${workspace.slug}`);
}

export interface CreateApiKeyState {
  error?: string;
  apiKey?: ApiKey;
  plaintext?: string;
}

export async function createApiKeyAction(name: string): Promise<CreateApiKeyState> {
  const workspace = await requireManagerRole();
  if (!name.trim()) {
    return { error: "Please name this key." };
  }

  try {
    const { apiKey, plaintext } = await createApiKey(workspace.id, name.trim());
    revalidatePath("/settings");
    return { apiKey, plaintext };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create API key." };
  }
}

export async function revokeApiKeyAction(formData: FormData) {
  const workspace = await requireManagerRole();
  const keyId = String(formData.get("keyId") ?? "");
  if (!keyId) return;

  await revokeApiKey(keyId, workspace.id);
  revalidatePath("/settings");
}

export async function createVendorAction(formData: FormData) {
  const workspace = await requireManagerRole();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const vendor = await createVendor(workspace.id, {
    name,
    contactEmail: String(formData.get("contactEmail") ?? "").trim() || undefined,
  });

  const inviteEmail = String(formData.get("inviteEmail") ?? "").trim();
  if (inviteEmail) {
    await inviteVendorUser(workspace.id, vendor.id, inviteEmail);
  }

  await logActivity(workspace.id, {
    type: "share",
    title: "Vendor added",
    description: `${name} was added as a vendor`,
  });

  revalidatePath("/settings");
}

export async function archiveVendorAction(formData: FormData) {
  const workspace = await requireManagerRole();
  const vendorId = String(formData.get("vendorId") ?? "");
  if (!vendorId) return;

  await archiveVendor(vendorId, workspace.id);
  revalidatePath("/settings");
}

export interface ConnectIntegrationState {
  error?: string;
}

export async function connectShopifyAction(formData: FormData): Promise<ConnectIntegrationState> {
  const workspace = await requireManagerRole();

  const shopDomain = String(formData.get("shopDomain") ?? "").trim();
  const accessToken = String(formData.get("accessToken") ?? "").trim();
  const apiSecret = String(formData.get("apiSecret") ?? "").trim();

  if (!shopDomain || !accessToken || !apiSecret) {
    return { error: "Shop domain, access token, and API secret are all required." };
  }

  try {
    await connectShopify(workspace.id, { shopDomain, accessToken, apiSecret });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to connect Shopify." };
  }

  await logActivity(workspace.id, {
    type: "integration",
    title: "Shopify connected",
    description: `Connected to ${shopDomain}.`,
  });

  revalidatePath("/settings");
  return {};
}

export async function connectSlackAction(formData: FormData): Promise<ConnectIntegrationState> {
  const workspace = await requireManagerRole();

  const webhookUrl = String(formData.get("webhookUrl") ?? "").trim();
  if (!webhookUrl) {
    return { error: "A Slack Incoming Webhook URL is required." };
  }

  try {
    await connectSlack(workspace.id, webhookUrl);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to connect Slack." };
  }

  await logActivity(workspace.id, {
    type: "integration",
    title: "Slack connected",
    description: "Order and low-stock alerts will now post to this channel.",
  });

  revalidatePath("/settings");
  return {};
}

export async function testSlackNotificationAction(): Promise<ConnectIntegrationState> {
  const workspace = await requireManagerRole();
  await notifySlack(workspace.id, ":wave: This is a test notification from CreativelyComm.");
  return {};
}

export async function disconnectIntegrationAction(formData: FormData) {
  const workspace = await requireManagerRole();
  const provider = String(formData.get("provider") ?? "") as IntegrationProvider;
  if (!provider) return;

  if (provider === "shopify") {
    await disconnectShopify(workspace.id);
  } else if (provider === "slack") {
    await disconnectSlack(workspace.id);
  } else {
    await disconnectIntegration(workspace.id, provider);
  }

  revalidatePath("/settings");
}

export async function regenerateFeedTokenAction() {
  const workspace = await requireManagerRole();
  await regenerateFeedToken(workspace.id);
  revalidatePath("/settings");
}
