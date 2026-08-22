-- AI-generated marketing campaigns, one per product. Generation itself
-- happens client-side via Puter.js (no server-side AI provider exists in
-- this project); this table only persists the settings + resulting content
-- so a draft can be left and resumed, edited, and managed from a real
-- dashboard -- same "the AI call is real, the persistence is real, nothing
-- here is fabricated" bar as every other feature in this app.

create type campaign_objective as enum (
  'sales',
  'launch',
  'awareness',
  'clearance',
  'seasonal',
  'retargeting'
);

create type campaign_channel as enum (
  'instagram',
  'facebook',
  'tiktok',
  'email',
  'whatsapp',
  'general'
);

create type campaign_status as enum ('draft', 'ready', 'active', 'paused', 'completed');

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  objective campaign_objective not null default 'sales',
  channel campaign_channel not null default 'general',
  audience text,
  tone text,
  duration text,
  offer text,
  additional_instructions text,
  status campaign_status not null default 'draft',
  -- Live, user-editable campaign content. Only the keys relevant to the
  -- chosen channel are populated. Regeneration replaces this wholesale;
  -- inline edits patch individual keys -- never overwritten except on an
  -- explicit regenerate/refine action.
  content jsonb not null default '{}'::jsonb,
  -- Last raw AI output, kept separately from `content` so a user's manual
  -- edits are never silently lost/blended with a later regeneration.
  generated_content jsonb,
  created_by text references "user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaigns_workspace_id_idx on campaigns(workspace_id, created_at desc);
create index if not exists campaigns_product_id_idx on campaigns(product_id);
create index if not exists campaigns_status_idx on campaigns(workspace_id, status);

alter table campaigns enable row level security;
