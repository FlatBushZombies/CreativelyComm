-- Shopify order ingestion (real sales feed Product Intelligence) and the
-- Shopify publish gate's "held" reason. Depends on 014_orders.sql,
-- 017_integration_links.sql, 018_hardware.sql (order_source enum).

alter type order_source add value if not exists 'shopify';

-- The Shopify order id, so a webhook retry or "orders/updated" upserts the same
-- row. A plain (non-partial) unique index on purpose: PostgREST's ON CONFLICT
-- can't target a partial index, and Postgres already treats NULL external ids
-- (manual/POS orders) as distinct, so they never collide.
alter table orders add column if not exists external_id text;
create unique index if not exists orders_external_unique_idx
  on orders(workspace_id, source, external_id);

-- Why a Published product is still a draft on Shopify (publish gate), or null.
alter table products add column if not exists shopify_held_reason text;
