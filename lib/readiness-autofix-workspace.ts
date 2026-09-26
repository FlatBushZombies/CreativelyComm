import "server-only";
import { getProducts, bulkUpdateProducts, type BulkProductUpdate } from "@/lib/products";
import { getFailedRulesByProduct } from "@/lib/readiness";
import { computeAutoFix } from "@/lib/readiness-autofix";
import { logActivity } from "@/lib/activity";

export interface WorkspaceAutoFixResult {
  productsFixed: number;
  issuesFixed: number;
  productsStillNeedingWork: number;
  /** Names of the products that would be / were changed (capped for previews). */
  changedProducts: { id: string; name: string; fixes: string[] }[];
}

/**
 * Catalog-wide auto-fix shared by the Readiness page's bulk action and the MCP
 * `auto_fix_readiness` tool. With `apply: false` it only computes what would
 * change (a preview); with `apply: true` it writes in one bulkUpdateProducts call.
 * `productId` narrows it to a single product.
 */
export async function autoFixWorkspaceReadiness(
  workspaceId: string,
  { apply, productId }: { apply: boolean; productId?: string }
): Promise<WorkspaceAutoFixResult> {
  const products = await getProducts(workspaceId);
  const failedRulesByProduct = await getFailedRulesByProduct(products, workspaceId);

  const updates: BulkProductUpdate[] = [];
  const changedProducts: WorkspaceAutoFixResult["changedProducts"] = [];
  let issuesFixed = 0;
  let productsStillNeedingWork = 0;

  for (const product of products) {
    if (productId && product.id !== productId) continue;
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
      changedProducts.push({ id: product.id, name: product.name, fixes: fixed.map((f) => f.label) });
      issuesFixed += fixed.length;
    }
    if (unresolvable.length > 0) productsStillNeedingWork += 1;
  }

  if (apply && updates.length > 0) {
    await bulkUpdateProducts(workspaceId, updates);
    await logActivity(workspaceId, {
      type: "publish",
      title: "Readiness issues auto-fixed",
      description: `${issuesFixed} issue${issuesFixed === 1 ? "" : "s"} fixed across ${updates.length} product${updates.length === 1 ? "" : "s"}.`,
    });
  }

  return { productsFixed: updates.length, issuesFixed, productsStillNeedingWork, changedProducts };
}
