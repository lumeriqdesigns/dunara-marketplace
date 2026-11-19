-- =============================================================================
-- Tighten public media bucket write policies to shop ownership (path prefix)
-- Path convention: {shop_id}/...
-- =============================================================================

-- shop-logos
drop policy if exists "shop_logos_auth_upload" on storage.objects;
create policy "shop_logos_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'shop-logos'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "shop_logos_auth_update" on storage.objects;
create policy "shop_logos_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'shop-logos'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  )
  with check (
    bucket_id = 'shop-logos'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "shop_logos_auth_delete" on storage.objects;
create policy "shop_logos_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'shop-logos'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );

-- listing-images
drop policy if exists "listing_images_auth_upload" on storage.objects;
create policy "listing_images_auth_upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-images'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "listing_images_auth_update" on storage.objects;
create policy "listing_images_auth_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'listing-images'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  )
  with check (
    bucket_id = 'listing-images'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "listing_images_auth_delete" on storage.objects;
create policy "listing_images_auth_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-images'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );
