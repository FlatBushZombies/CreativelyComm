-- Nano Banana campaign images: real generated/edited visuals a merchant
-- chooses to attach to a campaign, stored as public Supabase Storage URLs.
-- Depends on 019_campaigns.sql.

alter table campaigns add column if not exists images text[] not null default '{}';
