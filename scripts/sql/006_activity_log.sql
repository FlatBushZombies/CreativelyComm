-- Real activity feed, replacing the mock `activities` array in lib/mock-data.ts.
-- product_name is a denormalized snapshot (not a FK) so history reads sensibly
-- even after the product is renamed or deleted.

create type activity_type as enum ('upload', 'optimize', 'export', 'publish', 'share', 'import');

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  type activity_type not null,
  title text not null,
  description text not null,
  product_name text,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_workspace_id_idx on activity_log(workspace_id, created_at desc);
