"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace, updateWorkspaceBranding } from "@/lib/workspace";
import { inviteMember, removeMember, getMemberRole, type WorkspaceRole } from "@/lib/team";

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

  await updateWorkspaceBranding(workspace.id, { storeName, storeTagline, brandColor });
  revalidatePath("/settings");
  revalidatePath("/storefront");
  revalidatePath(`/store/${workspace.slug}`);
}
