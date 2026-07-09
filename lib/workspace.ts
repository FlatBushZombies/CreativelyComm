import "server-only";
import { cache } from "react";
import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  storeName: string | null;
  storeTagline: string | null;
  brandColor: string;
  hideBranding: boolean;
}

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  store_name: string | null;
  store_tagline: string | null;
  brand_color: string;
  hide_branding: boolean;
}

const WORKSPACE_COLUMNS =
  "id, name, slug, owner_id, store_name, store_tagline, brand_color, hide_branding";

function mapWorkspaceRow(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    owner_id: row.owner_id,
    storeName: row.store_name,
    storeTagline: row.store_tagline,
    brandColor: row.brand_color,
    hideBranding: row.hide_branding,
  };
}

export const getOrCreateDefaultWorkspace = cache(async function getOrCreateDefaultWorkspace(
  userId: string,
  userName: string
): Promise<Workspace> {
  const supabase = getSupabaseServerClient();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select(`workspaces(${WORKSPACE_COLUMNS})`)
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const existing = (membership as { workspaces: WorkspaceRow | null } | null)?.workspaces;
  if (existing) {
    return mapWorkspaceRow(existing);
  }

  const slug = `${userName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${randomUUID().slice(0, 6)}`;

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({ name: `${userName}'s Workspace`, slug, owner_id: userId })
    .select(WORKSPACE_COLUMNS)
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

  return mapWorkspaceRow(workspace as WorkspaceRow);
});

export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select(WORKSPACE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load workspace: ${error.message}`);
  }

  return data ? mapWorkspaceRow(data as WorkspaceRow) : null;
}

export async function updateWorkspaceBranding(
  workspaceId: string,
  input: { storeName: string; storeTagline: string; brandColor: string; hideBranding: boolean }
): Promise<Workspace> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspaces")
    .update({
      store_name: input.storeName,
      store_tagline: input.storeTagline,
      brand_color: input.brandColor,
      hide_branding: input.hideBranding,
    })
    .eq("id", workspaceId)
    .select(WORKSPACE_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(`Failed to update branding: ${error?.message}`);
  }

  return mapWorkspaceRow(data as WorkspaceRow);
}
