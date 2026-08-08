-- Real, workspace-scoped hardware feature persistence. Replaces the old
-- lib/hardware.ts client-only useState mockup (never persisted, no API, no
-- table). "Hardware" here means bring-your-own-device software workflows
-- (a phone/webcam for capture, any USB/Bluetooth barcode scanner, any
-- printer) -- not proprietary devices this product manufactures or ships.

create type hardware_feature as enum (
  'capture-dock',
  'scan-station',
  'qc-camera',
  'quick-sale',
  'content-kit'
);

-- One row per workspace per feature. enabled + config replace the old fake
-- per-session useState; config is a small jsonb bag of user-set options
-- (angle count, ring light intensity, scanner mode, etc.) rather than a
-- dedicated column per feature, since each feature's shape differs.
create table if not exists hardware_settings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  feature hardware_feature not null,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (workspace_id, feature)
);

-- Capture Dock: real multi-angle photo sessions, taken via the browser
-- camera. session_id groups shots taken in one capture run.
create table if not exists capture_shots (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  session_id uuid not null,
  image_url text not null,
  angle integer,
  created_at timestamptz not null default now()
);

-- Scan Station: real barcode scans (HID keyboard-wedge or camera
-- BarcodeDetector), logged whether or not they matched a product.
create type scan_action as enum ('intake', 'restock', 'verification');

create table if not exists scan_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  barcode text not null,
  matched_product_id uuid references products(id) on delete set null,
  action scan_action not null default 'intake',
  created_at timestamptz not null default now()
);

-- QC Camera: real pack-verification photos tied to a specific order.
create table if not exists qc_photos (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  image_url text not null,
  matches_listing boolean,
  created_at timestamptz not null default now()
);

-- Content Kit: a real fulfillment request, not a fabricated shipment log.
create type content_kit_status as enum ('requested', 'shipped', 'delivered');

create table if not exists content_kit_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  requested_by text references "user"(id) on delete set null,
  shipping_address text not null,
  status content_kit_status not null default 'requested',
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Distinguishes orders created through the Quick Sale (barcode-first,
-- in-person) entry point from the standard manual "New Order" flow -- both
-- call the same lib/orders.ts createOrder, this is just provenance so the
-- Hardware page can show real Quick Sale activity.
create type order_source as enum ('manual', 'pos');
alter table orders add column if not exists source order_source not null default 'manual';

create index if not exists capture_shots_workspace_id_idx on capture_shots(workspace_id, created_at desc);
create index if not exists capture_shots_product_id_idx on capture_shots(product_id);
create index if not exists scan_events_workspace_id_idx on scan_events(workspace_id, created_at desc);
create index if not exists qc_photos_order_id_idx on qc_photos(order_id);
create index if not exists content_kit_requests_workspace_id_idx on content_kit_requests(workspace_id, requested_at desc);
create index if not exists orders_source_idx on orders(workspace_id, source);

alter table hardware_settings enable row level security;
alter table capture_shots enable row level security;
alter table scan_events enable row level security;
alter table qc_photos enable row level security;
alter table content_kit_requests enable row level security;
