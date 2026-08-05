-- Multi-vendor marketplace: "one workspace, many sub-vendors". A vendor is
-- scoped to a single workspace and is not a separate tenant/auth system --
-- vendor users are workspace_members with role = 'vendor' (see below), same
-- Better Auth session as everyone else.

create table if not exists vendors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  contact_email text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create index if not exists vendors_workspace_id_idx on vendors(workspace_id);

-- New role for vendor-scoped workspace members. Added to the existing enum
-- rather than a parallel role system, since workspace_members already
-- carries invite_token/invited_email/status machinery vendor invites reuse.
alter type workspace_role add value if not exists 'vendor';

alter table workspace_members
  add column if not exists vendor_id uuid references vendors(id) on delete set null;

-- Nullable: null = workspace-owned product, non-null = that vendor's product.
alter table products
  add column if not exists vendor_id uuid references vendors(id) on delete set null;

create index if not exists products_vendor_id_idx on products(vendor_id);

alter table vendors enable row level security;
-- No policies defined, matching every other table's baseline RLS posture:
-- only the service-role key (used server-side) can read/write.
