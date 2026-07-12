"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import {
  createCustomRule,
  deleteCustomRule,
  getReadinessOverview,
  type RuleCheckType,
} from "@/lib/readiness";
import { getProducts } from "@/lib/products";
import { logActivity } from "@/lib/activity";

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

  // Re-score the catalog against the new rule and surface it as a real
  // notification -- the honest version of "affected products get re-scored
  // automatically and the team is notified" (no external policy-change feed
  // exists; this fires on the workspace's own rule edits).
  const products = await getProducts(workspace.id);
  const overview = await getReadinessOverview(products, workspace.id);
  const channelSummary = overview.channelAverages.find((c) => c.channel.id === channelId);
  if (channelSummary) {
    await logActivity(workspace.id, {
      type: "publish",
      title: "Readiness rule added",
      description: `Added a custom rule for ${channelSummary.channel.name} — catalog is now ${channelSummary.averageScore}% ready on average.`,
    });
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
  const channelName = String(formData.get("channelName") ?? "");
  if (!ruleId) return;

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  await deleteCustomRule(ruleId, workspace.id);

  await logActivity(workspace.id, {
    type: "publish",
    title: "Readiness rule removed",
    description: channelName
      ? `Removed a custom rule for ${channelName}.`
      : "A custom readiness rule was removed.",
  });

  revalidatePath("/readiness");
}
