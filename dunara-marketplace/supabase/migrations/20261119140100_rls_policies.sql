-- =============================================================================
-- Dunara MVP — Row Level Security policies (V3 foundation)
-- Least-privilege. Admin role policies added in Admin module.
-- =============================================================================

-- Enable RLS on every application table
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.shops enable row level security;
alter table public.listings enable row level security;
alter table public.listing_media enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.verification_requests enable row level security;
alter table public.payment_events enable row level security;
alter table public.ai_assistant_settings enable row level security;
alter table public.ai_usage_monthly enable row level security;
alter table public.ai_reply_events enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: shop ownership
-- ---------------------------------------------------------------------------
create or replace function public.is_shop_owner(shop uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.shops s
    where s.id = shop
      and s.owner_id = (select auth.uid())
  );
$$;

revoke all on function public.is_shop_owner(uuid) from public;
grant execute on function public.is_shop_owner(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Insert is handled by security definer trigger on auth.users

-- ---------------------------------------------------------------------------
-- categories (public read)
-- ---------------------------------------------------------------------------
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories for select
  to anon, authenticated
  using (true);

-- No client insert/update/delete — seed / operator only

-- ---------------------------------------------------------------------------
-- shops
-- Public: published + not suspended
-- Owner: full manage
-- ---------------------------------------------------------------------------
drop policy if exists "shops_public_read_published" on public.shops;
create policy "shops_public_read_published"
  on public.shops for select
  to anon, authenticated
  using (is_published = true and is_suspended = false);

drop policy if exists "shops_owner_select" on public.shops;
create policy "shops_owner_select"
  on public.shops for select
  to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "shops_owner_insert" on public.shops;
create policy "shops_owner_insert"
  on public.shops for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "shops_owner_update" on public.shops;
create policy "shops_owner_update"
  on public.shops for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    -- sellers cannot self-verify or clear suspension
    and verification_status = (select s.verification_status from public.shops s where s.id = shops.id)
    and verified_at is not distinct from (select s.verified_at from public.shops s where s.id = shops.id)
    and is_suspended = (select s.is_suspended from public.shops s where s.id = shops.id)
  );

-- No delete policy for sellers (soft-unpublish instead)

-- ---------------------------------------------------------------------------
-- listings
-- Public: published listing under published non-suspended shop
-- Owner: manage own shop listings
-- ---------------------------------------------------------------------------
drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read"
  on public.listings for select
  to anon, authenticated
  using (
    is_published = true
    and exists (
      select 1 from public.shops s
      where s.id = listings.shop_id
        and s.is_published = true
        and s.is_suspended = false
    )
  );

drop policy if exists "listings_owner_select" on public.listings;
create policy "listings_owner_select"
  on public.listings for select
  to authenticated
  using (public.is_shop_owner(shop_id));

drop policy if exists "listings_owner_insert" on public.listings;
create policy "listings_owner_insert"
  on public.listings for insert
  to authenticated
  with check (public.is_shop_owner(shop_id));

drop policy if exists "listings_owner_update" on public.listings;
create policy "listings_owner_update"
  on public.listings for update
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

drop policy if exists "listings_owner_delete" on public.listings;
create policy "listings_owner_delete"
  on public.listings for delete
  to authenticated
  using (public.is_shop_owner(shop_id));

-- ---------------------------------------------------------------------------
-- listing_media — follows parent listing visibility
-- ---------------------------------------------------------------------------
drop policy if exists "listing_media_public_read" on public.listing_media;
create policy "listing_media_public_read"
  on public.listing_media for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.listings l
      join public.shops s on s.id = l.shop_id
      where l.id = listing_media.listing_id
        and l.is_published = true
        and s.is_published = true
        and s.is_suspended = false
    )
  );

drop policy if exists "listing_media_owner_all" on public.listing_media;
create policy "listing_media_owner_all"
  on public.listing_media for all
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_media.listing_id
        and public.is_shop_owner(l.shop_id)
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_media.listing_id
        and public.is_shop_owner(l.shop_id)
    )
  );

-- ---------------------------------------------------------------------------
-- plans — public read active plans only
-- ---------------------------------------------------------------------------
drop policy if exists "plans_public_read_active" on public.plans;
create policy "plans_public_read_active"
  on public.plans for select
  to anon, authenticated
  using (is_active = true);

-- No client mutation of plans

-- ---------------------------------------------------------------------------
-- subscriptions — owner reads own shop subscription only
-- Clients cannot insert/update payment state (webhooks / server only)
-- ---------------------------------------------------------------------------
drop policy if exists "subscriptions_owner_select" on public.subscriptions;
create policy "subscriptions_owner_select"
  on public.subscriptions for select
  to authenticated
  using (public.is_shop_owner(shop_id));

-- No insert/update/delete policies for authenticated clients

-- ---------------------------------------------------------------------------
-- verification_requests — seller reads own shop requests; insert constrained
-- Review fields updated only by trusted admin actions (Module 11)
-- ---------------------------------------------------------------------------
drop policy if exists "verification_requests_owner_select" on public.verification_requests;
create policy "verification_requests_owner_select"
  on public.verification_requests for select
  to authenticated
  using (public.is_shop_owner(shop_id));

drop policy if exists "verification_requests_owner_insert" on public.verification_requests;
create policy "verification_requests_owner_insert"
  on public.verification_requests for insert
  to authenticated
  with check (
    public.is_shop_owner(shop_id)
    and status = 'pending'
    and submitted_by = (select auth.uid())
  );

-- No direct update/delete for sellers (status, priority, reviewed_* protected)

-- ---------------------------------------------------------------------------
-- payment_events — no client access (server/webhook only)
-- ---------------------------------------------------------------------------
-- Intentionally no policies for anon/authenticated → deny by default with RLS on

-- ---------------------------------------------------------------------------
-- AI tables — shop owner only
-- ---------------------------------------------------------------------------
drop policy if exists "ai_settings_owner_select" on public.ai_assistant_settings;
create policy "ai_settings_owner_select"
  on public.ai_assistant_settings for select
  to authenticated
  using (public.is_shop_owner(shop_id));

drop policy if exists "ai_settings_owner_insert" on public.ai_assistant_settings;
create policy "ai_settings_owner_insert"
  on public.ai_assistant_settings for insert
  to authenticated
  with check (public.is_shop_owner(shop_id));

drop policy if exists "ai_settings_owner_update" on public.ai_assistant_settings;
create policy "ai_settings_owner_update"
  on public.ai_assistant_settings for update
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

drop policy if exists "ai_usage_owner_select" on public.ai_usage_monthly;
create policy "ai_usage_owner_select"
  on public.ai_usage_monthly for select
  to authenticated
  using (public.is_shop_owner(shop_id));

-- Usage increments happen via server-side RPC / service role; no client insert/update

drop policy if exists "ai_reply_events_owner_select" on public.ai_reply_events;
create policy "ai_reply_events_owner_select"
  on public.ai_reply_events for select
  to authenticated
  using (public.is_shop_owner(shop_id));

-- No client insert into ai_reply_events (server records events)
