import "server-only";
import { randomBytes, createHash } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
}

function mapRow(row: ApiKeyRow): ApiKey {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
  };
}

export function hashApiKey(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

/**
 * Creates a new API key and returns the plaintext once — it's never stored,
 * only its SHA-256 hash. A fast hash is correct here (unlike passwords)
 * since the key itself is a high-entropy random token, not user-chosen.
 */
export async function createApiKey(
  workspaceId: string,
  name: string
): Promise<{ apiKey: ApiKey; plaintext: string }> {
  const supabase = getSupabaseServerClient();
  const plaintext = `sk_live_${randomBytes(24).toString("hex")}`;
  const keyPrefix = plaintext.slice(0, 12);
  const keyHash = hashApiKey(plaintext);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({ workspace_id: workspaceId, name, key_prefix: keyPrefix, key_hash: keyHash })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create API key: ${error?.message}`);
  }

  return { apiKey: mapRow(data as ApiKeyRow), plaintext };
}

export async function listApiKeys(workspaceId: string): Promise<ApiKey[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, last_used_at, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load API keys: ${error.message}`);
  }

  return (data as ApiKeyRow[]).map(mapRow);
}

export async function revokeApiKey(id: string, workspaceId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to revoke API key: ${error.message}`);
  }
}
