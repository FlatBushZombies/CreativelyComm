-- Self-serve custom readiness rules: additive, per-workspace overlay on top
-- of the global channel_rules seeded in 003_channel_readiness.sql. Never
-- edit channel_rules directly from the app -- it's shared across every
-- workspace, so per-workspace customization lives here instead.

create table if not exists workspace_channel_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  channel_id uuid not null references channels(id) on delete cascade,
  key text not null,
  label text not null,
  check_type rule_check_type not null,
  config jsonb not null default '{}',
  weight integer not null default 10,
  created_at timestamptz not null default now(),
  unique (workspace_id, channel_id, key)
);

create index if not exists workspace_channel_rules_workspace_id_idx
  on workspace_channel_rules(workspace_id);
