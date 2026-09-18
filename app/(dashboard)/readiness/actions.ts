"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import {
  createCustomRule,
  deleteCustomRule,
  getReadinessOverview,
  getFailedRulesByProduct,
  type RuleCheckType,
} from "@/lib/readiness";
import { getProducts, bulkUpdateProducts, type BulkProductUpdate } from "@/lib/products";
import { logActivity } from "@/lib/activity";
import { computeAutoFix } from "@/lib/readiness-autofix";

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

export interface BulkAutoFixState {
  error?: string;
  productsFixed?: number;
  issuesFixed?: number;
  productsStillNeedingWork?: number;
}

/**
 * Catalog-wide version of autoFixProductReadinessAction (products/[id]/actions.ts):
 * computes and applies an auto-fix patch for every product that has one,
 * in a single bulkUpdateProducts call rather than one update per product.
 */
export async function bulkAutoFixReadinessAction(): Promise<BulkAutoFixState> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const products = await getProducts(workspace.id);
  const failedRulesByProduct = await getFailedRulesByProduct(products, workspace.id);

  const updates: BulkProductUpdate[] = [];
  let issuesFixed = 0;
  let productsStillNeedingWork = 0;

  for (const product of products) {
    const failedRules = failedRulesByProduct.get(product.id) ?? [];
    if (failedRules.length === 0) continue;

    const { patch, fixed, unresolvable } = computeAutoFix(product, failedRules, products);
    if (Object.keys(patch).length > 0) {
      updates.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: patch.category ?? product.category,
        status: product.status,
        sku: patch.sku ?? product.sku,
        description: patch.description ?? product.description,
        tags: patch.tags ?? product.tags,
      });
      issuesFixed += fixed.length;
    }
    if (unresolvable.length > 0) productsStillNeedingWork += 1;
  }

  if (updates.length > 0) {
    try {
      await bulkUpdateProducts(workspace.id, updates);
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Failed to apply fixes." };
    }

    await logActivity(workspace.id, {
      type: "publish",
      title: "Readiness issues auto-fixed",
      description: `${issuesFixed} issue${issuesFixed === 1 ? "" : "s"} fixed across ${updates.length} product${updates.length === 1 ? "" : "s"}.`,
    });
  }

  revalidatePath("/readiness");
  revalidatePath("/products");
  return { productsFixed: updates.length, issuesFixed, productsStillNeedingWork };
}
