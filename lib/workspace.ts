import "server-only";
import { cache } from "react";
import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

export const getOrCreateDefaultWorkspace = cache(async function getOrCreateDefaultWorkspace(
  userId: string,
  userName: string
): Promise<Workspace> {
  const supabase = getSupabaseServerClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspaces(id, name, slug, owner_id)")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const existing = (membership as { workspaces: Workspace | null } | null)?.workspaces;
  if (existing) {
    return existing;
  }

  const slug = `${userName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomUUID().slice(0, 6)}`;

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ name: `${userName}'s Workspace`, slug, owner_id: userId })
    .select()
    .single();

  if (error || !workspace) {
    throw new Error(`Failed to create workspace: ${error?.message}`);
  }

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: userId,
    role: "owner",
    status: "active",
  });

  if (memberError) {
    throw new Error(`Failed to create workspace membership: ${memberError.message}`);
  }

  return workspace;
});
