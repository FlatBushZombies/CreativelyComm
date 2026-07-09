-- White-label toggle: hides the "Powered by CreativelyComm" footer on the
-- public storefront/product pages and the embed widget. Fully open to all
-- workspaces for now — no plan gating (billing/plans deferred).

alter table workspaces
  add column if not exists hide_branding boolean not null default false;
