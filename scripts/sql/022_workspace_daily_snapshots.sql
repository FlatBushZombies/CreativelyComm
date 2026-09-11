-- "What Changed" diagnostic layer (Phase 1 of the cross-tool context work --
-- see lib/diagnostics.ts). One row per workspace per calendar day, written
-- opportunistically (no cron exists in this app) the first time a page that
-- needs one is visited that day. History only accumulates forward from the
-- day this ships -- there is no retroactive backfill, so week-over-week
-- comparisons must honestly report "not enough history yet" until a row
-- from ~7 days ago actually exists.

create table if not exists workspace_daily_snapshots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  snapshot_date date not null,
  avg_readiness_score integer not null default 0,
  total_views integer not null default 0,
  total_revenue numeric(12,2) not null default 0,
  order_count integer not null default 0,
  low_stock_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, snapshot_date)
);

create index if not exists workspace_daily_snapshots_workspace_id_idx
  on workspace_daily_snapshots(workspace_id);

alter table workspace_daily_snapshots enable row level security;
