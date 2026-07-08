import "server-only";
import { randomUUID } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";
export type MembershipStatus = "active" | "pending";

export interface WorkspaceMember {
  id: string;
  userId: string | null;
  invitedEmail: string | null;
  role: WorkspaceRole;
  status: MembershipStatus;
  inviteToken: string | null;
  name: string | null;
  email: string | null;
  createdAt: string;
}

interface MemberRow {
  id: string;
  user_id: string | null;
  invited_email: string | null;
  role: WorkspaceRole;
  status: MembershipStatus;
  invite_token: string | null;
  created_at: string;
  user: { name: string; email: string } | null;
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id, user_id, invited_email, role, status, invite_token, created_at, user:user_id(name, email)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load team members: ${error.message}`);
  }

  return (data as unknown as MemberRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    invitedEmail: row.invited_email,
    role: row.role,
    status: row.status,
    inviteToken: row.invite_token,
    name: row.user?.name ?? null,
    email: row.user?.email ?? row.invited_email,
    createdAt: row.created_at,
  }));
}

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole
): Promise<WorkspaceMember> {
  const supabase = getSupabaseServerClient();
  const inviteToken = randomUUID();

  const { data, error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      invited_email: email,
      role,
      status: "pending",
      invite_token: inviteToken,
    })
    .select("id, user_id, invited_email, role, status, invite_token, created_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to invite member: ${error?.message}`);
  }

  return {
    id: data.id,
    userId: data.user_id,
    invitedEmail: data.invited_email,
    role: data.role,
    status: data.status,
    inviteToken: data.invite_token,
    name: null,
    email: data.invited_email,
    createdAt: data.created_at,
  };
}

export async function getMemberRole(
  workspaceId: string,
  userId: string
): Promise<WorkspaceRole | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load member role: ${error.message}`);
  }

  return data?.role ?? null;
}

export async function removeMember(memberId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("workspace_members").delete().eq("id", memberId);

  if (error) {
    throw new Error(`Failed to remove member: ${error.message}`);
  }
}

export async function acceptInvite(token: string, userId: string): Promise<WorkspaceMember | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .update({ user_id: userId, status: "active", invite_token: null })
    .eq("invite_token", token)
    .eq("status", "pending")
    .select("id, user_id, invited_email, role, status, invite_token, created_at")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to accept invite: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    invitedEmail: data.invited_email,
    role: data.role,
    status: data.status,
    inviteToken: data.invite_token,
    name: null,
    email: data.invited_email,
    createdAt: data.created_at,
  };
}
