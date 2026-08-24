-- Content Packs: one product photo turned into a set of platform-specific,
-- creative-typed image variations. Platforms/creative types are code config
-- (lib/platforms.ts, lib/creative-types.ts), not DB tables, since they're
-- static app configuration rather than user data.

create type content_pack_status as enum ('draft', 'generating', 'completed', 'failed');
create type asset_status as enum ('queued', 'processing', 'completed', 'failed');

create table if not exists content_packs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  source_image_url text not null,
  vision_insight jsonb,
  status content_pack_status not null default 'draft',
  created_by text references "user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- approved is its own column, not folded into asset_status: "needs review"
-- is just "completed and not yet approved" -- mixing workflow-progress and
-- review-decision into one enum gets messy fast.
create table if not exists content_pack_assets (
  id uuid primary key default gen_random_uuid(),
  content_pack_id uuid not null references content_packs(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  platform_id text not null,
  creative_type text not null,
  status asset_status not null default 'queued',
  image_url text,
  width integer,
  height integer,
  error_message text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_packs_product_id_idx on content_packs(product_id, created_at desc);
create index if not exists content_pack_assets_pack_id_idx on content_pack_assets(content_pack_id);
create index if not exists content_pack_assets_workspace_status_idx on content_pack_assets(workspace_id, status);

alter table content_packs enable row level security;
alter table content_pack_assets enable row level security;
