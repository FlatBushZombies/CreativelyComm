-- Denormalized links to external records, same precedent as
-- stock_adjustments.order_id: no FK, just enough to match a webhook payload
-- or guard against double-processing.

alter table products
  add column if not exists shopify_product_id text,
  add column if not exists shopify_variant_id text,
  add column if not exists shopify_inventory_item_id text;

create index if not exists products_shopify_product_id_idx
  on products(shopify_product_id) where shopify_product_id is not null;

-- Idempotency guard so updateOrderStatus never double-creates an invoice
-- for the same order if the paid transition somehow fires twice.
alter table orders
  add column if not exists quickbooks_invoice_id text;
