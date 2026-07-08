-- Branding fields for the public storefront (Settings > Branding tab).
-- Nullable so existing rows don't need backfilling; UI falls back to
-- workspace.name / a generic tagline / the default green when unset.

alter table workspaces
  add column if not exists store_name text,
  add column if not exists store_tagline text,
  add column if not exists brand_color text not null default '#386641';
