-- Public Storage bucket for product images uploaded via the "Add Product" form.
-- Uploads go through the server (service-role key, bypasses RLS), so the only
-- policy needed here is public read access so <Image> can serve the URLs.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- CREATE POLICY has no IF NOT EXISTS guard, so wrap it to make this script
-- safe to re-run (see the memory note on CREATE TYPE non-idempotency).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read access for product-images'
  ) then
    create policy "Public read access for product-images"
      on storage.objects for select
      using (bucket_id = 'product-images');
  end if;
end $$;
