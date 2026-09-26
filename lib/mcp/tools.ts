import "server-only";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getProducts, getProductById } from "@/lib/products";
import { getChannelsWithReadiness } from "@/lib/readiness";
import { getIntelligenceOverview, getListingAnalytics } from "@/lib/intelligence";
import { ensureTodaySnapshot, getWeekOverWeekComparison, getProductMovers } from "@/lib/diagnostics";
import { autoFixWorkspaceReadiness } from "@/lib/readiness-autofix-workspace";
import { getIntegration } from "@/lib/integrations/store";
import { syncProductsToShopify } from "@/lib/integrations/shopify";

/** Products pushed per confirmed sync call -- Shopify's REST limit (~2 req/s) makes larger batches outlive a request. */
const SYNC_BATCH_LIMIT = 40;
const PREVIEW_LIST_LIMIT = 20;

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function failure(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

/**
 * Registers the CreativelyComm tools on an MCP server scoped to one
 * workspace (resolved from the API key by the route -- no tool ever takes a
 * workspace id from the caller).
 *
 * Write tools follow a preview -> confirm pattern: `confirm` defaults to
 * false and only describes what WOULD change. API keys have no scopes yet, so
 * this is the safety gate against an agent changing the catalog by accident.
 */
export function registerTools(server: McpServer, workspaceId: string): void {
  server.registerTool(
    "get_catalog_health",
    {
      title: "Catalog health",
      description:
        "Channel-readiness summary for the whole catalog: average score per sales channel (Shopify, Amazon, Etsy, ...), how many products are listing-ready (score >= 80), and the top rules blocking the most products. Start here.",
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const products = await getProducts(workspaceId);
      const { readiness } = await getIntelligenceOverview(workspaceId);
      const ready = readiness.products.filter((p) => p.averageScore >= 80).length;
      return json({
        totalProducts: products.length,
        readyProducts: ready,
        averageScore:
          readiness.products.length === 0
            ? 0
            : Math.round(readiness.products.reduce((s, p) => s + p.averageScore, 0) / readiness.products.length),
        channels: readiness.channelAverages.map((c) => ({ channel: c.channel.name, averageScore: c.averageScore })),
        topBlockers: readiness.topBlockers.map((b) => ({
          channel: b.channel.name,
          rule: b.ruleLabel,
          productsFailing: b.failCount,
          share: Math.round(b.failRate * 100) + "%",
        })),
        worstProducts: readiness.products.slice(0, 5).map((p) => ({ id: p.product.id, name: p.product.name, score: p.averageScore })),
      });
    }
  );

  server.registerTool(
    "list_conversion_gaps",
    {
      title: "Conversion gaps",
      description:
        "Products that sold zero units despite either (a) decent traffic and a complete listing, or (b) an incomplete listing (readiness < 50). Uses real orders, including mirrored Shopify orders. It does not diagnose the cause of (a).",
      inputSchema: { limit: z.number().int().min(1).max(50).optional().describe("Max rows (default 20)") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ limit }) => {
      const { conversionGaps } = await getIntelligenceOverview(workspaceId);
      return json({
        total: conversionGaps.length,
        gaps: conversionGaps.slice(0, limit ?? 20).map((g) => ({
          id: g.product.id,
          name: g.product.name,
          classification: g.classification,
          views: g.views,
          readinessScore: g.readinessScore,
        })),
      });
    }
  );

  server.registerTool(
    "get_what_changed",
    {
      title: "What changed this week",
      description:
        "Week-over-week revenue, orders, views and readiness, plus the products whose revenue swung most with stock and readiness context. Reports 'not available' until a week of snapshots exists instead of guessing.",
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      // Records today's snapshot (idempotent) -- the same opportunistic write the /diagnostics page does.
      await ensureTodaySnapshot(workspaceId);
      const [comparison, movers] = await Promise.all([getWeekOverWeekComparison(workspaceId), getProductMovers(workspaceId, 10)]);
      return json({
        comparison: comparison.available ? comparison.deltas : "Not available yet: tracking needs about a week of daily snapshots.",
        movers: movers.map((m) => ({
          id: m.product.id,
          name: m.product.name,
          revenueThisWeek: m.revenueLast7Days,
          revenueLastWeek: m.revenuePrior7Days,
          unitsThisWeek: m.unitsLast7Days,
          readinessScore: m.readinessScore,
          currentStock: m.currentStock,
          recentStockChange: m.recentStockChange,
        })),
      });
    }
  );

  server.registerTool(
    "get_product_readiness",
    {
      title: "Product readiness",
      description: "Per-channel readiness score for one product with the exact rules it passes and fails.",
      inputSchema: { product_id: z.string().describe("Product id from another tool's output") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ product_id }) => {
      const product = await getProductById(product_id, workspaceId);
      if (!product) return failure("No product with that id in this workspace.");
      const channels = await getChannelsWithReadiness(product, workspaceId);
      return json({
        id: product.id,
        name: product.name,
        status: product.status,
        channels: channels.map((c) => ({
          channel: c.channel.name,
          score: c.score,
          failing: c.failed.map((r) => r.label),
          passing: c.passed.map((r) => r.label),
        })),
      });
    }
  );

  server.registerTool(
    "get_listing_analytics",
    {
      title: "Listing attribute analytics",
      description:
        "Which listing attributes (photo count, description length, tags, readiness, price) go with products actually selling, inside this catalog. Correlation only. Returns a reason instead of numbers when there isn't enough data.",
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => json(await getListingAnalytics(workspaceId))
  );

  server.registerTool(
    "auto_fix_readiness",
    {
      title: "Auto-fix readiness issues",
      description:
        "Fixes readiness failures that can be derived honestly from the product's own data (missing SKU, short description, no tags, no category). Never touches price or photos. WRITES to the catalog: call with confirm=false first to preview, then confirm=true to apply. Optionally limit to one product.",
      inputSchema: {
        product_id: z.string().optional().describe("Limit to a single product; omit for the whole catalog"),
        confirm: z.boolean().default(false).describe("false = preview only, true = apply the changes"),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ product_id, confirm }) => {
      if (product_id && !(await getProductById(product_id, workspaceId))) {
        return failure("No product with that id in this workspace.");
      }
      try {
        const result = await autoFixWorkspaceReadiness(workspaceId, { apply: confirm === true, productId: product_id });
        return json({
          applied: confirm === true,
          note: confirm === true ? "Changes were applied." : "Preview only. Call again with confirm=true to apply.",
          productsChanged: result.productsFixed,
          issuesFixed: result.issuesFixed,
          productsStillNeedingWork: result.productsStillNeedingWork,
          changes: result.changedProducts.slice(0, PREVIEW_LIST_LIMIT),
          moreNotShown: Math.max(0, result.changedProducts.length - PREVIEW_LIST_LIMIT),
        });
      } catch (err) {
        return failure(err instanceof Error ? err.message : "Failed to auto-fix.");
      }
    }
  );

  server.registerTool(
    "sync_to_shopify",
    {
      title: "Sync catalog to Shopify",
      description: `Pushes products (photos, price, stock) to the connected Shopify store. Handles up to ${SYNC_BATCH_LIMIT} products per call, never-synced first; call again for the rest. WRITES to Shopify: call with confirm=false first to preview, then confirm=true.`,
      inputSchema: { confirm: z.boolean().default(false).describe("false = preview only, true = push to Shopify") },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ confirm }) => {
      const integration = await getIntegration(workspaceId, "shopify");
      if (!integration || integration.status !== "connected") {
        return failure("Shopify isn't connected for this workspace. Connect it in Settings > Integrations.");
      }
      const products = await getProducts(workspaceId);
      const ordered = [...products].sort((a, b) => Number(!!a.shopifyProductId) - Number(!!b.shopifyProductId));
      const batch = ordered.slice(0, SYNC_BATCH_LIMIT);
      const neverSynced = products.filter((p) => !p.shopifyProductId).length;

      if (confirm !== true) {
        return json({
          applied: false,
          note: "Preview only. Call again with confirm=true to push.",
          shop: integration.shopifyShopDomain,
          totalProducts: products.length,
          neverSynced,
          willSyncNow: batch.length,
          remainingAfterThis: Math.max(0, products.length - batch.length),
        });
      }

      const result = await syncProductsToShopify(workspaceId, batch);
      return json({
        applied: true,
        synced: result.synced,
        failed: result.failed,
        errors: result.errors,
        remaining: Math.max(0, products.length - batch.length),
      });
    }
  );
}
