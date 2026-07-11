-- Public API keys. Only key_hash (SHA-256) is stored -- the plaintext key is
-- shown once at creation time and never persisted. key_prefix is just the
-- first few characters, kept for display so a workspace can tell its keys
-- apart in the UI without ever re-exposing the full secret.

create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists api_keys_workspace_id_idx on api_keys(workspace_id);
