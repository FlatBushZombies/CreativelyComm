"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace, updateWorkspaceBranding } from "@/lib/workspace";
import { inviteMember, removeMember, getMemberRole, type WorkspaceRole } from "@/lib/team";
import { logActivity } from "@/lib/activity";
import { createApiKey, revokeApiKey, type ApiKey } from "@/lib/api-keys";

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
