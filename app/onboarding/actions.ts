"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace, updateWorkspaceBranding } from "@/lib/workspace";

export async function saveStoreNameAction(storeName: string) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const trimmed = storeName.trim();
  if (!trimmed) return;

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  await updateWorkspaceBranding(workspace.id, {
    storeName: trimmed,
    storeTagline: workspace.storeTagline ?? "",
    brandColor: workspace.brandColor,
    hideBranding: workspace.hideBranding,
  });
}
