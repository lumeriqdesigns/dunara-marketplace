-- Dúnarà Marketplace — security should-fix pass
-- 1) Split coarse FOR ALL RLS on seller-owned tables
-- 2) Report reason constraint + index for triage
-- 3) Message attachment MIME/size parity checks

begin;

-- ---------------------------------------------------------------------------
-- 1. Split FOR ALL policies → explicit INSERT / UPDATE / DELETE
-- ---------------------------------------------------------------------------

-- provider_service_areas
drop policy if exists "Sellers manage their own service areas" on public.provider_service_areas;

create policy "Sellers insert own service areas"
  on public.provider_service_areas for insert
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "Sellers update own service areas"
  on public.provider_service_areas for update
  using (public.owns_seller_profile(seller_id) or public.is_admin())
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "Sellers delete own service areas"
  on public.provider_service_areas for delete
  using (public.owns_seller_profile(seller_id) or public.is_admin());

-- provider_availability
drop policy if exists "Sellers manage their own availability" on public.provider_availability;

create policy "Sellers insert own availability"
  on public.provider_availability for insert
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "Sellers update own availability"
  on public.provider_availability for update
  using (public.owns_seller_profile(seller_id) or public.is_admin())
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "Sellers delete own availability"
  on public.provider_availability for delete
  using (public.owns_seller_profile(seller_id) or public.is_admin());

-- service_listings
drop policy if exists "Sellers manage their own listings" on public.service_listings;

create policy "Sellers insert own listings"
  on public.service_listings for insert
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "Sellers update own listings"
  on public.service_listings for update
  using (public.owns_seller_profile(seller_id) or public.is_admin())
  with check (public.owns_seller_profile(seller_id) or public.is_admin());

create policy "Sellers delete own listings"
  on public.service_listings for delete
  using (public.owns_seller_profile(seller_id) or public.is_admin());

-- listing_media
drop policy if exists "Sellers manage media for their listings" on public.listing_media;

create policy "Sellers insert media for own listings"
  on public.listing_media for insert
  with check (
    exists (
      select 1 from public.service_listings sl
      where sl.id = listing_id and public.owns_seller_profile(sl.seller_id)
    )
    or public.is_admin()
  );

create policy "Sellers update media for own listings"
  on public.listing_media for update
  using (
    exists (
      select 1 from public.service_listings sl
      where sl.id = listing_id and public.owns_seller_profile(sl.seller_id)
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.service_listings sl
      where sl.id = listing_id and public.owns_seller_profile(sl.seller_id)
    )
    or public.is_admin()
  );

create policy "Sellers delete media for own listings"
  on public.listing_media for delete
  using (
    exists (
      select 1 from public.service_listings sl
      where sl.id = listing_id and public.owns_seller_profile(sl.seller_id)
    )
    or public.is_admin()
  );

-- categories: split admin FOR ALL
drop policy if exists "Admins manage categories" on public.categories;

create policy "Admins insert categories"
  on public.categories for insert
  with check (public.is_admin());

create policy "Admins update categories"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete categories"
  on public.categories for delete
  using (public.is_admin());

-- favourites (if FOR ALL exists)
drop policy if exists "Users manage their own favourites" on public.favourites;

do $$
begin
  -- Recreate explicit policies if table has RLS and no granular policies yet
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'favourites' and policyname = 'Users insert own favourites'
  ) then
    execute $p$
      create policy "Users insert own favourites"
        on public.favourites for insert
        with check (user_id = auth.uid())
    $p$;
    execute $p$
      create policy "Users delete own favourites"
        on public.favourites for delete
        using (user_id = auth.uid() or public.is_admin())
    $p$;
    execute $p$
      create policy "Users select own favourites"
        on public.favourites for select
        using (user_id = auth.uid() or public.is_admin())
    $p$;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Reports: reason length + triage indexes; optional reason vocabulary
-- ---------------------------------------------------------------------------

-- Bound reason / details size (abuse resistance)
alter table public.reports
  drop constraint if exists reports_reason_len;

alter table public.reports
  add constraint reports_reason_len
  check (char_length(reason) between 3 and 120);

alter table public.reports
  drop constraint if exists reports_details_len;

alter table public.reports
  add constraint reports_details_len
  check (details is null or char_length(details) <= 2000);

create index if not exists idx_reports_open_created
  on public.reports (created_at desc)
  where status in ('open', 'under_review');

create index if not exists idx_reports_target
  on public.reports (target_type, target_id);

-- ---------------------------------------------------------------------------
-- 3. Message attachments: MIME + size parity with app constants
-- ---------------------------------------------------------------------------

alter table public.message_attachments
  drop constraint if exists message_attachments_mime_allowed;

alter table public.message_attachments
  add constraint message_attachments_mime_allowed
  check (
    mime_type in (
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    )
  );

alter table public.message_attachments
  drop constraint if exists message_attachments_size_max;

alter table public.message_attachments
  add constraint message_attachments_size_max
  check (file_size_bytes > 0 and file_size_bytes <= 5242880);

comment on constraint message_attachments_mime_allowed on public.message_attachments is
  'Parity with ALLOWED_ATTACHMENT_MIME in application code.';

comment on constraint message_attachments_size_max on public.message_attachments is
  'Parity with MAX_ATTACHMENT_BYTES (5 MiB) in application code.';

commit;
