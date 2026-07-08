-- Application schema: workspaces, membership/roles, and products.
-- Depends on 001_better_auth_core.sql ("user" table).

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id text not null references "user"(id) on delete cascade,
  created_at timestamptz not null default now()
);

create type workspace_role as enum ('owner', 'admin', 'editor', 'viewer');
create type membership_status as enum ('active', 'pending');

create table if not exists workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id text references "user"(id) on delete cascade,
  invited_email text,
  role workspace_role not null default 'viewer',
  status membership_status not null default 'active',
  invite_token text unique,
  created_at timestamptz not null default now(),
  constraint workspace_members_identity check (
    user_id is not null or invited_email is not null
  )
);

create type product_status as enum ('draft', 'pending', 'optimized', 'published');

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null default 0,
  category text not null default '',
  status product_status not null default 'draft',
  images text[] not null default '{}',
  optimized_images text[] not null default '{}',
  sku text,
  tags text[] not null default '{}',
  views integer not null default 0,
  exports integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_members_workspace_id_idx on workspace_members(workspace_id);
create index if not exists workspace_members_user_id_idx on workspace_members(user_id);
create unique index if not exists workspace_members_invite_token_idx on workspace_members(invite_token) where invite_token is not null;
create index if not exists products_workspace_id_idx on products(workspace_id);

-- Baseline RLS posture: app reads/writes go through the server using the
-- Supabase service role key, which bypasses RLS. These policies exist so
-- these tables aren't wide open if the anon key is ever used client-side.
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table products enable row level security;
-- No policies are defined for the anon/authenticated roles, so with RLS
-- enabled and no policies, only the service role can read/write these tables.
