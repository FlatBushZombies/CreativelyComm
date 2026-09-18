-- Per-product Shopify sync status, so the UI can show which listings actually
-- landed on the store and why one didn't. Depends on 017_integration_links.sql.

alter table products add column if not exists shopify_synced_at timestamptz;
alter table products add column if not exists shopify_sync_error text;
