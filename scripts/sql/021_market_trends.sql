-- Market Intelligence (Google Trends) scaffolding. Google's Trends API is
-- still an application-gated alpha (no self-serve key available as of this
-- writing) -- see lib/trends.ts for the honest "not configured" behavior
-- until real credentials exist. This table just persists the most recent
-- fetched snapshot per product once credentials are available; one row per
-- product (upserted on refresh), same "latest snapshot" shape as
-- product_translations' one-row-per-product-per-locale pattern.

create table if not exists product_trend_snapshots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  search_term text not null,
  interest_over_time jsonb not null default '[]'::jsonb,
  top_regions jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now(),
  source text not null default 'google_trends',
  unique (product_id)
);

create index if not exists product_trend_snapshots_workspace_id_idx
  on product_trend_snapshots(workspace_id);

alter table product_trend_snapshots enable row level security;
