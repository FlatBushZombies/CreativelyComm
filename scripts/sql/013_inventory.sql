-- Inventory: flat stock tracking on the existing products row (sku is
-- already 1:1 per product -- no variant matrix needed for what was asked).

alter table products
  add column if not exists track_inventory boolean not null default true,
  add column if not exists stock_quantity integer not null default 0,
  add column if not exists low_stock_threshold integer not null default 5;

create type stock_adjustment_reason as enum ('restock', 'sale', 'correction', 'return', 'damaged');

-- Audit trail for every stock change. order_id has no FK (orders table
-- doesn't exist yet at this point in migration order, and this mirrors
-- activity_log.product_name's precedent of a denormalized, non-FK reference
-- that still reads sensibly if the referenced row is later deleted).
create table if not exists stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  order_id uuid,
  delta integer not null,
  reason stock_adjustment_reason not null,
  note text,
  created_by text references "user"(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stock_adjustments_product_id_idx on stock_adjustments(product_id, created_at desc);
create index if not exists stock_adjustments_workspace_id_idx on stock_adjustments(workspace_id);

-- New activity types for order automation notifications (reuses the
-- existing activity_log -> getRecentActivity -> NotificationsDropdown
-- pipeline; no new notification infrastructure). This is the first
-- migration in this repo to alter an already-existing enum -- safe because
-- the new values are never referenced in the same transaction that adds
-- them (they're only used by application code in later, separate queries).
alter type activity_type add value if not exists 'low_stock';
alter type activity_type add value if not exists 'order';

alter table stock_adjustments enable row level security;
