-- Product version history: a snapshot recorded at each real mutation point
-- (creation, background removal). No general "edit product" flow exists yet,
-- so this won't show field-level edits until one is added.

create table if not exists product_versions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  change_summary text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists product_versions_product_id_idx on product_versions(product_id, created_at desc);
