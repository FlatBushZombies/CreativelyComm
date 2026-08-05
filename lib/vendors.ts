import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { inviteMember, getMemberRole } from "@/lib/team";

export interface Vendor {
  id: string;
  name: string;
  contactEmail: string | null;
  status: string;
  createdAt: string;
}

interface VendorRow {
  id: string;
  name: string;
  contact_email: string | null;
  status: string;
  created_at: string;
}

function mapRow(row: VendorRow): Vendor {
  return {
    id: row.id,
    name: row.name,
    contactEmail: row.contact_email,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getVendors(workspaceId: string): Promise<Vendor[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load vendors: ${error.message}`);
  }

  return (data as VendorRow[]).map(mapRow);
}

export async function getVendorById(id: string, workspaceId: string): Promise<Vendor | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load vendor: ${error.message}`);
  }

  return data ? mapRow(data as VendorRow) : null;
}

export interface CreateVendorInput {
  name: string;
  contactEmail?: string;
}

export async function createVendor(workspaceId: string, input: CreateVendorInput): Promise<Vendor> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendors")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      contact_email: input.contactEmail ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create vendor: ${error?.message}`);
  }

  return mapRow(data as VendorRow);
}

export async function updateVendor(
  id: string,
  workspaceId: string,
  input: Partial<CreateVendorInput>
): Promise<Vendor | null> {
  const supabase = getSupabaseServerClient();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.contactEmail !== undefined) patch.contact_email = input.contactEmail;

  const { data, error } = await supabase
    .from("vendors")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update vendor: ${error.message}`);
  }

  return data ? mapRow(data as VendorRow) : null;
}

export async function archiveVendor(id: string, workspaceId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("vendors")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to archive vendor: ${error.message}`);
  }
}

/**
 * Invites a user to manage a specific vendor's products/orders within the
 * workspace. Reuses lib/team.ts's invite flow (invited_email/invite_token,
 * accepted the same way any other member invite is) forced to the 'vendor'
 * role, then patches vendor_id onto the resulting membership row since
 * inviteMember has no vendor concept of its own.
 */
export async function inviteVendorUser(workspaceId: string, vendorId: string, email: string) {
  const supabase = getSupabaseServerClient();
  const member = await inviteMember(workspaceId, email, "vendor");

  const { error } = await supabase
    .from("workspace_members")
    .update({ vendor_id: vendorId })
    .eq("id", member.id);

  if (error) {
    throw new Error(`Failed to link invite to vendor: ${error.message}`);
  }

  return { ...member, vendorId };
}

/**
 * Returns the vendorId a user should be scoped to, or null if they have
 * full-workspace access (owner/admin/editor/viewer). Used to filter
 * products/orders down to a single vendor's own data.
 */
export async function getVendorScopeForUser(
  workspaceId: string,
  userId: string
): Promise<string | null> {
  const role = await getMemberRole(workspaceId, userId);
  if (role !== "vendor") return null;

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("vendor_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load vendor scope: ${error.message}`);
  }

  return data?.vendor_id ?? null;
}
