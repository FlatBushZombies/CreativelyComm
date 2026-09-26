import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type IntegrationProvider = "shopify" | "slack" | "quickbooks";
export type IntegrationStatus = "disconnected" | "connected" | "error";

/** Safe to send to a client component -- credentials are deliberately excluded. */
export interface IntegrationSummary {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  shopifyShopDomain: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  /** Shopify: false when order webhooks weren't registered (token lacks read_orders), null when not applicable/unknown. */
  ordersSync: boolean | null;
  /** Shopify publish gate: hold Published products as drafts until they're listing-ready. */
  publishGate: boolean;
}

export interface Integration extends IntegrationSummary {
  id: string;
  workspaceId: string;
  credentials: Record<string, unknown>;
  config: Record<string, unknown>;
}

interface IntegrationRow {
  id: string;
  workspace_id: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  credentials: Record<string, unknown>;
  config: Record<string, unknown>;
  shopify_shop_domain: string | null;
  last_synced_at: string | null;
  last_error: string | null;
}

function mapRow(row: IntegrationRow): Integration {
  const config = row.config ?? {};
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    provider: row.provider,
    status: row.status,
    credentials: row.credentials ?? {},
    config,
    shopifyShopDomain: row.shopify_shop_domain,
    lastSyncedAt: row.last_synced_at,
    lastError: row.last_error,
    ordersSync: typeof config.ordersSync === "boolean" ? config.ordersSync : null,
    publishGate: config.publishGate === true,
  };
}

function toSummary(integration: Integration): IntegrationSummary {
  const { provider, status, shopifyShopDomain, lastSyncedAt, lastError, config } = integration;
  return {
    provider,
    status,
    shopifyShopDomain,
    lastSyncedAt,
    lastError,
    ordersSync: typeof config.ordersSync === "boolean" ? config.ordersSync : null,
    publishGate: config.publishGate === true,
  };
}

/** Full row including credentials -- server-side use only (making outbound calls). */
export async function getIntegration(
  workspaceId: string,
  provider: IntegrationProvider
): Promise<Integration | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("provider", provider)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load ${provider} integration: ${error.message}`);
  }

  return data ? mapRow(data as IntegrationRow) : null;
}

export async function getIntegrationByShopDomain(shopDomain: string): Promise<Integration | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("provider", "shopify")
    .eq("shopify_shop_domain", shopDomain)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load integration for shop ${shopDomain}: ${error.message}`);
  }

  return data ? mapRow(data as IntegrationRow) : null;
}

/** Credential-free summaries -- safe to pass to a client component. */
export async function listIntegrations(workspaceId: string): Promise<IntegrationSummary[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("integrations")
    .select("provider, status, shopify_shop_domain, last_synced_at, last_error, config")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to load integrations: ${error.message}`);
  }

  return (data as IntegrationRow[]).map((row) => toSummary(mapRow(row)));
}

export interface UpsertIntegrationInput {
  status: IntegrationStatus;
  credentials?: Record<string, unknown>;
  config?: Record<string, unknown>;
  shopifyShopDomain?: string;
  lastError?: string | null;
}

export async function upsertIntegration(
  workspaceId: string,
  provider: IntegrationProvider,
  input: UpsertIntegrationInput
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("integrations").upsert(
    {
      workspace_id: workspaceId,
      provider,
      status: input.status,
      credentials: input.credentials ?? {},
      config: input.config ?? {},
      shopify_shop_domain: input.shopifyShopDomain ?? null,
      last_error: input.lastError ?? null,
      last_synced_at: input.status === "connected" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,provider" }
  );

  if (error) {
    throw new Error(`Failed to save ${provider} integration: ${error.message}`);
  }
}

/** Merges keys into an integration's config (upsertIntegration replaces config wholesale, so it can't be used for partial updates). */
export async function updateIntegrationConfig(
  workspaceId: string,
  provider: IntegrationProvider,
  patch: Record<string, unknown>
): Promise<void> {
  const integration = await getIntegration(workspaceId, provider);
  if (!integration) {
    throw new Error(`${provider} isn't connected.`);
  }
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("integrations")
    .update({ config: { ...integration.config, ...patch }, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("provider", provider);

  if (error) {
    throw new Error(`Failed to update ${provider} settings: ${error.message}`);
  }
}

export async function markIntegrationError(
  workspaceId: string,
  provider: IntegrationProvider,
  message: string
): Promise<void> {
  const supabase = getSupabaseServerClient();
  await supabase
    .from("integrations")
    .update({ status: "error", last_error: message, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("provider", provider);
}

export async function markIntegrationSynced(
  workspaceId: string,
  provider: IntegrationProvider
): Promise<void> {
  const supabase = getSupabaseServerClient();
  await supabase
    .from("integrations")
    .update({ last_synced_at: new Date().toISOString(), last_error: null })
    .eq("workspace_id", workspaceId)
    .eq("provider", provider);
}

export async function disconnectIntegration(
  workspaceId: string,
  provider: IntegrationProvider
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("integrations")
    .update({ status: "disconnected", credentials: {}, config: {}, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId)
    .eq("provider", provider);

  if (error) {
    throw new Error(`Failed to disconnect ${provider}: ${error.message}`);
  }
}
