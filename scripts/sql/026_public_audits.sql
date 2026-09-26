-- Free public listing audit (/audit). Anonymous visitors score a public Shopify
-- store's /products.json against the DEFAULT channel readiness rules. Rows are
-- written and read only by the server (service role); RLS is on with no
-- policies so the anon key can't touch them. ip_hash is an HMAC of the visitor
-- IP -- used only for the hourly rate limit, never the raw address.

create table if not exists public_audits (
  id text primary key,
  domain text not null,
  product_count integer not null,
  ready_count integer not null default 0,
  avg_score integer not null,
  issues_total integer not null default 0,
  issues_fixable integer not null default 0,
  channel_scores jsonb not null default '[]'::jsonb,
  top_blockers jsonb not null default '[]'::jsonb,
  worst_products jsonb not null default '[]'::jsonb,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists public_audits_ip_created_idx on public_audits(ip_hash, created_at desc);
create index if not exists public_audits_domain_created_idx on public_audits(domain, created_at desc);

alter table public_audits enable row level security;
