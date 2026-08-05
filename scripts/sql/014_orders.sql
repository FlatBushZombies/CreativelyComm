-- Orders / POS. No payment processor integration -- payment_method is a
-- recorded field only (cash/card/other), not a charge. "Order automation"
-- lives in application code (lib/orders.ts: stock deduction on create,
-- reversal on cancel, forward-only status transitions), not in triggers.

create type order_status as enum ('open', 'paid', 'fulfilled', 'cancelled', 'refunded');
create type payment_method as enum ('cash', 'card', 'other');

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  status order_status not null default 'open',
  payment_method payment_method,
  customer_name text,
  customer_email text,
  subtotal numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  note text,
  created_by text references "user"(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Line items snapshot product_name/sku/unit_price at order time so the
-- receipt reads correctly even if the product is later renamed, repriced,
-- reassigned to a different vendor, or deleted (product_id/vendor_id are
-- nullable, set null on delete, same denormalization precedent as
-- activity_log.product_name).
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  product_name text not null,
  sku text,
  unit_price numeric(10, 2) not null,
  quantity integer not null,
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_workspace_id_idx on orders(workspace_id, created_at desc);
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists order_items_vendor_id_idx on order_items(vendor_id);

alter table orders enable row level security;
alter table order_items enable row level security;
