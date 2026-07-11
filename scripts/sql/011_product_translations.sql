-- Real listing localization via DeepL (see lib/translate.ts). One row per
-- product per locale; the public product page falls back to the original
-- name/description when no translation exists for the requested ?lang=.

create table if not exists product_translations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  locale text not null,
  name text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, locale)
);

create index if not exists product_translations_product_id_idx
  on product_translations(product_id);
