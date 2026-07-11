"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { createCustomRule, deleteCustomRule, type RuleCheckType } from "@/lib/readiness";

export interface CreateCustomRuleState {
  error?: string;
}

export async function createCustomRuleAction(
  formData: FormData
): Promise<CreateCustomRuleState> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const channelId = String(formData.get("channelId") ?? "");
  const key = String(formData.get("key") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const checkType = String(formData.get("checkType") ?? "") as RuleCheckType;
  const field = String(formData.get("field") ?? "").trim();
  const minRaw = String(formData.get("min") ?? "").trim();
  const weight = Number(formData.get("weight") ?? 10) || 10;

  if (!channelId || !key || !label || !checkType || !field) {
    return { error: "Please fill in all fields." };
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  try {
    await createCustomRule(workspace.id, {
      channelId,
      key,
      label,
      checkType,
      field,
      min: minRaw ? Number(minRaw) : undefined,
      weight,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create rule." };
  }

  revalidatePath("/readiness");
  return {};
}

export async function deleteCustomRuleAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const ruleId = String(formData.get("ruleId") ?? "");
  if (!ruleId) return;

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  await deleteCustomRule(ruleId, workspace.id);
  revalidatePath("/readiness");
}
