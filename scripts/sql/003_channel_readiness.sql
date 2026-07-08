-- Channel Readiness Engine: channel list + deterministic rulebook per channel.
-- Depends on 002_app_schema.sql.
--
-- Rules here are practical, common-sense listing-quality checks (has a SKU,
-- has a real price, enough images, a description long enough to not look
-- empty, etc). They are NOT a verified, up-to-date copy of any marketplace's
-- actual current policies -- treat channel_rules as a configurable starting
-- point to tune, not as a compliance guarantee.

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create type rule_check_type as enum (
  'field_present',
  'field_positive',
  'min_array_length',
  'min_text_length'
);

create table if not exists channel_rules (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  key text not null,
  label text not null,
  check_type rule_check_type not null,
  config jsonb not null default '{}',
  weight integer not null default 10,
  unique (channel_id, key)
);

create index if not exists channel_rules_channel_id_idx on channel_rules(channel_id);

insert into channels (slug, name) values
  ('shopify', 'Shopify'),
  ('woocommerce', 'WooCommerce'),
  ('etsy', 'Etsy'),
  ('amazon', 'Amazon'),
  ('google', 'Google Merchant'),
  ('facebook', 'Facebook Catalog'),
  ('tiktok', 'TikTok Shop')
on conflict (slug) do nothing;

-- Shopify: light-touch checks
insert into channel_rules (channel_id, key, label, check_type, config, weight)
select id, 'sku_present', 'Has a SKU', 'field_present'::rule_check_type,'{"field": "sku"}'::jsonb,20 from channels where slug = 'shopify'
union all
select id, 'price_positive', 'Price is set', 'field_positive'::rule_check_type,'{"field": "price"}'::jsonb,20 from channels where slug = 'shopify'
union all
select id, 'min_images', 'At least 1 image', 'min_array_length'::rule_check_type,'{"field": "images", "min": 1}'::jsonb,30 from channels where slug = 'shopify'
union all
select id, 'description_min_length', 'Description at least 20 characters', 'min_text_length'::rule_check_type,'{"field": "description", "min": 20}'::jsonb,30 from channels where slug = 'shopify'
on conflict (channel_id, key) do nothing;

-- WooCommerce: same shape as Shopify
insert into channel_rules (channel_id, key, label, check_type, config, weight)
select id, 'sku_present', 'Has a SKU', 'field_present'::rule_check_type,'{"field": "sku"}'::jsonb,20 from channels where slug = 'woocommerce'
union all
select id, 'price_positive', 'Price is set', 'field_positive'::rule_check_type,'{"field": "price"}'::jsonb,20 from channels where slug = 'woocommerce'
union all
select id, 'min_images', 'At least 1 image', 'min_array_length'::rule_check_type,'{"field": "images", "min": 1}'::jsonb,30 from channels where slug = 'woocommerce'
union all
select id, 'description_min_length', 'Description at least 20 characters', 'min_text_length'::rule_check_type,'{"field": "description", "min": 20}'::jsonb,30 from channels where slug = 'woocommerce'
on conflict (channel_id, key) do nothing;

-- Etsy: leans on tags for search + a real description
insert into channel_rules (channel_id, key, label, check_type, config, weight)
select id, 'price_positive', 'Price is set', 'field_positive'::rule_check_type,'{"field": "price"}'::jsonb,15 from channels where slug = 'etsy'
union all
select id, 'min_images', 'At least 1 image', 'min_array_length'::rule_check_type,'{"field": "images", "min": 1}'::jsonb,20 from channels where slug = 'etsy'
union all
select id, 'description_min_length', 'Description at least 50 characters', 'min_text_length'::rule_check_type,'{"field": "description", "min": 50}'::jsonb,30 from channels where slug = 'etsy'
union all
select id, 'tags_present', 'At least 1 search tag', 'min_array_length'::rule_check_type,'{"field": "tags", "min": 1}'::jsonb,35 from channels where slug = 'etsy'
on conflict (channel_id, key) do nothing;

-- Amazon: stricter on images, description, and SKU
insert into channel_rules (channel_id, key, label, check_type, config, weight)
select id, 'sku_present', 'Has a SKU', 'field_present'::rule_check_type,'{"field": "sku"}'::jsonb,25 from channels where slug = 'amazon'
union all
select id, 'price_positive', 'Price is set', 'field_positive'::rule_check_type,'{"field": "price"}'::jsonb,15 from channels where slug = 'amazon'
union all
select id, 'min_images', 'At least 3 images', 'min_array_length'::rule_check_type,'{"field": "images", "min": 3}'::jsonb,30 from channels where slug = 'amazon'
union all
select id, 'description_min_length', 'Description at least 100 characters', 'min_text_length'::rule_check_type,'{"field": "description", "min": 100}'::jsonb,30 from channels where slug = 'amazon'
on conflict (channel_id, key) do nothing;

-- Google Merchant: category + identifier heavy
insert into channel_rules (channel_id, key, label, check_type, config, weight)
select id, 'sku_present', 'Has a SKU / product identifier', 'field_present'::rule_check_type,'{"field": "sku"}'::jsonb,25 from channels where slug = 'google'
union all
select id, 'category_set', 'Category is set', 'field_present'::rule_check_type,'{"field": "category"}'::jsonb,25 from channels where slug = 'google'
union all
select id, 'price_positive', 'Price is set', 'field_positive'::rule_check_type,'{"field": "price"}'::jsonb,20 from channels where slug = 'google'
union all
select id, 'description_min_length', 'Description at least 50 characters', 'min_text_length'::rule_check_type,'{"field": "description", "min": 50}'::jsonb,30 from channels where slug = 'google'
on conflict (channel_id, key) do nothing;

-- Facebook Catalog: image + description focused
insert into channel_rules (channel_id, key, label, check_type, config, weight)
select id, 'price_positive', 'Price is set', 'field_positive'::rule_check_type,'{"field": "price"}'::jsonb,20 from channels where slug = 'facebook'
union all
select id, 'min_images', 'At least 1 image', 'min_array_length'::rule_check_type,'{"field": "images", "min": 1}'::jsonb,30 from channels where slug = 'facebook'
union all
select id, 'description_min_length', 'Description at least 30 characters', 'min_text_length'::rule_check_type,'{"field": "description", "min": 30}'::jsonb,30 from channels where slug = 'facebook'
union all
select id, 'category_set', 'Category is set', 'field_present'::rule_check_type,'{"field": "category"}'::jsonb,20 from channels where slug = 'facebook'
on conflict (channel_id, key) do nothing;

-- TikTok Shop: image + tags for discovery
insert into channel_rules (channel_id, key, label, check_type, config, weight)
select id, 'price_positive', 'Price is set', 'field_positive'::rule_check_type,'{"field": "price"}'::jsonb,20 from channels where slug = 'tiktok'
union all
select id, 'min_images', 'At least 1 image', 'min_array_length'::rule_check_type,'{"field": "images", "min": 1}'::jsonb,30 from channels where slug = 'tiktok'
union all
select id, 'description_min_length', 'Description at least 30 characters', 'min_text_length'::rule_check_type,'{"field": "description", "min": 30}'::jsonb,25 from channels where slug = 'tiktok'
union all
select id, 'tags_present', 'At least 1 search tag', 'min_array_length'::rule_check_type,'{"field": "tags", "min": 1}'::jsonb,25 from channels where slug = 'tiktok'
on conflict (channel_id, key) do nothing;

alter table channels enable row level security;
alter table channel_rules enable row level security;
