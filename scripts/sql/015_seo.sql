-- Built-in SEO: per-product meta fields + a slug for the public storefront
-- URL. Score/checklist logic lives in lib/seo.ts (a fixed checklist, not a
-- configurable rule system like channel readiness -- nothing here calls for
-- per-workspace custom SEO rules).

alter table products
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists slug text;

create unique index if not exists products_workspace_slug_idx
  on products(workspace_id, slug) where slug is not null;
