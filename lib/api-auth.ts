import "server-only";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { hashApiKey } from "@/lib/api-keys";

/**
 * Authenticates a request to the public API (app/api/v1/**) using a
 * `Authorization: Bearer <key>` header, since these routes serve external
 * scripts/integrations, not the dashboard session. Route Handlers under
 * app/api/** are never touched by proxy.ts, so every route calls this
 * itself rather than relying on any upstream protection.
 */
export async function authenticateApiRequest(
  request: NextRequest
): Promise<{ workspaceId: string } | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const plaintext = match[1].trim();
  const keyHash = hashApiKey(plaintext);

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, workspace_id")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error || !data) return null;

  // Fire-and-forget — a failed last_used_at update shouldn't fail the request.
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id)
    .then(() => {});

  return { workspaceId: data.workspace_id as string };
}
