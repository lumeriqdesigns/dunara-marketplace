-- =============================================================================
-- Shop logos storage bucket (run in Supabase SQL editor / storage setup)
-- Note: Creating storage buckets via SQL requires storage schema access.
-- Prefer Dashboard → Storage → New bucket if this fails in your project.
-- =============================================================================

-- Public bucket for shop logos (logos are meant to be publicly visible)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-logos',
  'shop-logos',
  true,
  2097152, -- 2MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Authenticated users can upload only under paths they own conceptually.
-- Path convention used by the app: {shop_id}/logo-*.ext
-- Policy: any authenticated user may upload; RLS on shops prevents binding
-- another seller's logo_url. Tighten further with a custom claim if needed.

drop policy if exists "shop_logos_public_read" on storage.objects;
create policy "shop_logos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'shop-logos');

drop policy if exists "shop_logos_auth_upload" on storage.objects;
create policy "shop_logos_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'shop-logos');

drop policy if exists "shop_logos_auth_update" on storage.objects;
create policy "shop_logos_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'shop-logos')
  with check (bucket_id = 'shop-logos');

drop policy if exists "shop_logos_auth_delete" on storage.objects;
create policy "shop_logos_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'shop-logos');
