-- Bring-your-own-account integrations (Shopify, Slack, QuickBooks). Every
-- credential here is provided by the workspace itself, never by us -- there
-- is no OAuth app of ours behind any of this except QuickBooks, which is
-- OAuth-only by Intuit's design and needs QUICKBOOKS_CLIENT_ID/SECRET env
-- vars the operator must obtain themselves before it does anything.
--
-- SECURITY NOTE: credentials are stored in plaintext (jsonb), retrievably --
-- unlike api_keys (which only ever stores a one-way hash, since those are
-- verified, never reused outbound), these have to be read back to make
-- outbound calls on the workspace's behalf. This app has no at-rest
-- encryption layer anywhere; env vars + DB access via the service-role key
-- are the only existing trust boundary (RLS enabled, zero policies, same as
-- every other table here). Accepted as a known limitation, not an oversight.

create type integration_provider as enum ('shopify', 'slack', 'quickbooks');
create type integration_status as enum ('disconnected', 'connected', 'error');

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  provider integration_provider not null,
  status integration_status not null default 'disconnected',
  credentials jsonb not null default '{}',
  config jsonb not null default '{}',
  shopify_shop_domain text,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, provider)
);

create unique index if not exists integrations_shopify_shop_domain_idx
  on integrations(shopify_shop_domain) where shopify_shop_domain is not null;
create index if not exists integrations_workspace_id_idx on integrations(workspace_id);

-- Stable per-workspace token embedded in the Google Merchant / Meta Catalog
-- feed URLs (their own documented scheduled-fetch mechanism -- no OAuth
-- needed for either), so the URL isn't just a guessable workspace id.
alter table workspaces
  add column if not exists feed_token text unique default encode(gen_random_bytes(24), 'hex');

alter type activity_type add value if not exists 'integration';

alter table integrations enable row level security;
