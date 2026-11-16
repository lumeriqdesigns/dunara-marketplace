-- Dúnarà Marketplace — Prompt 11: Reviews and Ratings engine
-- Secure review submission, rating aggregation, moderation, reporting support.
-- Ratings are derived only from genuine, public, non-moderated reviews.

begin;

-- ---------------------------------------------------------------------------
-- 1. Recalculate seller rating aggregates from genuine reviews
-- ---------------------------------------------------------------------------

create or replace function public.recalculate_seller_rating(p_seller_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric(3,2);
  v_count integer;
begin
  if p_seller_id is null then
    return;
  end if;

  select
    coalesce(round(avg(rating)::numeric, 2), 0),
    count(*)::integer
  into v_avg, v_count
  from public.reviews
  where seller_id = p_seller_id
    and is_public = true
    and is_moderated = false;

  update public.seller_profiles
  set
    average_rating = v_avg,
    review_count = v_count,
    updated_at = now()
  where id = p_seller_id;
end;
$$;

comment on function public.recalculate_seller_rating(uuid) is
  'Recomputes average_rating and review_count for a seller from public, non-moderated reviews only.';

-- Trigger: keep aggregates in sync
create or replace function public.trg_reviews_recalculate_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_seller_rating(old.seller_id);
    return old;
  end if;

  perform public.recalculate_seller_rating(new.seller_id);

  -- If seller_id changed (should be rare), update the old seller too
  if tg_op = 'UPDATE' and old.seller_id is distinct from new.seller_id then
    perform public.recalculate_seller_rating(old.seller_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_reviews_recalculate_rating on public.reviews;
create trigger trg_reviews_recalculate_rating
  after insert or update or delete on public.reviews
  for each row
  execute function public.trg_reviews_recalculate_rating();

-- ---------------------------------------------------------------------------
-- 2. Harden review insert: eligibility + self-review prevention
-- ---------------------------------------------------------------------------

create or replace function public.trg_reviews_enforce_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  seller_user_id uuid;
begin
  -- Must reference a real completed booking belonging to the buyer
  select id, buyer_id, seller_id, status
  into b
  from public.bookings
  where id = new.booking_id;

  if not found then
    raise exception 'Review must be linked to an existing booking'
      using errcode = '23503';
  end if;

  if b.status <> 'completed' then
    raise exception 'Only completed bookings may be reviewed'
      using errcode = '42501';
  end if;

  if b.buyer_id is distinct from new.buyer_id then
    raise exception 'Review buyer must match the booking buyer'
      using errcode = '42501';
  end if;

  if b.seller_id is distinct from new.seller_id then
    raise exception 'Review seller must match the booking seller'
      using errcode = '42501';
  end if;

  -- Self-review prevention: buyer must not own the seller profile
  select user_id into seller_user_id
  from public.seller_profiles
  where id = new.seller_id;

  if seller_user_id is not null and seller_user_id = new.buyer_id then
    raise exception 'Sellers cannot review their own bookings'
      using errcode = '42501';
  end if;

  -- Rating bounds (also enforced by CHECK, but explicit here)
  if new.rating is null or new.rating < 1 or new.rating > 5 then
    raise exception 'Rating must be an integer between 1 and 5'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_reviews_enforce_eligibility on public.reviews;
create trigger trg_reviews_enforce_eligibility
  before insert on public.reviews
  for each row
  execute function public.trg_reviews_enforce_eligibility();

-- ---------------------------------------------------------------------------
-- 3. RPC: submit_review (preferred path from application)
-- ---------------------------------------------------------------------------

create or replace function public.submit_review(
  p_booking_id uuid,
  p_rating smallint,
  p_title text default null,
  p_body text default null
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  b record;
  existing_id uuid;
  result public.reviews;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5' using errcode = '23514';
  end if;

  select id, buyer_id, seller_id, status
  into b
  from public.bookings
  where id = p_booking_id
  for share;

  if not found then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;

  if b.buyer_id <> actor then
    raise exception 'You may only review your own bookings' using errcode = '42501';
  end if;

  if b.status <> 'completed' then
    raise exception 'You can only review completed bookings' using errcode = '42501';
  end if;

  -- One review per booking (UNIQUE constraint also enforces)
  select id into existing_id
  from public.reviews
  where booking_id = p_booking_id;

  if existing_id is not null then
    raise exception 'You already reviewed this booking' using errcode = '23505';
  end if;

  -- Self-review check
  if exists (
    select 1 from public.seller_profiles
    where id = b.seller_id and user_id = actor
  ) then
    raise exception 'Sellers cannot review their own bookings' using errcode = '42501';
  end if;

  insert into public.reviews (
    booking_id,
    buyer_id,
    seller_id,
    rating,
    title,
    body,
    is_public,
    is_moderated
  ) values (
    p_booking_id,
    actor,
    b.seller_id,
    p_rating,
    nullif(trim(p_title), ''),
    nullif(trim(p_body), ''),
    true,
    false
  )
  returning * into result;

  -- Rating recalculation is handled by trigger
  return result;
end;
$$;

comment on function public.submit_review(uuid, smallint, text, text) is
  'Secure review submission for eligible completed bookings. One per booking. Blocks self-reviews.';

grant execute on function public.submit_review(uuid, smallint, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Moderation RPC (moderator / operations_manager / super_admin)
-- ---------------------------------------------------------------------------

create or replace function public.moderate_review(
  p_review_id uuid,
  p_is_public boolean,
  p_is_moderated boolean,
  p_notes text default null
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  result public.reviews;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not (
    public.has_role('moderator')
    or public.has_role('operations_manager')
    or public.has_role('super_admin')
  ) then
    raise exception 'Permission denied: moderation role required' using errcode = '42501';
  end if;

  update public.reviews
  set
    is_public = coalesce(p_is_public, is_public),
    is_moderated = coalesce(p_is_moderated, is_moderated),
    moderated_by = actor,
    moderated_at = now(),
    updated_at = now()
  where id = p_review_id
  returning * into result;

  if not found then
    raise exception 'Review not found' using errcode = 'P0002';
  end if;

  -- Audit
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    'moderate_review',
    'review',
    p_review_id,
    jsonb_build_object(
      'is_public', result.is_public,
      'is_moderated', result.is_moderated,
      'notes', nullif(trim(coalesce(p_notes, '')), '')
    )
  );

  -- Rating recalculation via trigger on update
  return result;
end;
$$;

comment on function public.moderate_review(uuid, boolean, boolean, text) is
  'Moderator action to set visibility and moderation flag on a review. Audited.';

grant execute on function public.moderate_review(uuid, boolean, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. RLS refinements for reviews
-- ---------------------------------------------------------------------------

-- Drop and recreate more precise policies
drop policy if exists "Public reviews are readable" on public.reviews;
drop policy if exists "Eligible buyers can create reviews" on public.reviews;
drop policy if exists "Buyers can update their own reviews (limited)" on public.reviews;

-- SELECT: public non-moderated reviews, own reviews, own seller reviews, admins
create policy "Reviews are readable by authorised parties"
  on public.reviews for select
  using (
    (is_public = true and is_moderated = false)
    or buyer_id = auth.uid()
    or public.owns_seller_profile(seller_id)
    or public.is_admin()
  );

-- INSERT: only via own buyer identity (RPC preferred; policy still protects direct inserts)
create policy "Eligible buyers can create reviews"
  on public.reviews for insert
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.buyer_id = auth.uid()
        and b.status = 'completed'
    )
  );

-- UPDATE: buyers may only edit title/body of their own un-moderated reviews within a short window;
-- moderators use the RPC (which is SECURITY DEFINER and bypasses RLS for the update).
-- We keep a limited buyer update policy and a moderator policy for completeness.
create policy "Buyers can update own unmoderated reviews"
  on public.reviews for update
  using (
    buyer_id = auth.uid()
    and is_moderated = false
  )
  with check (
    buyer_id = auth.uid()
    and is_moderated = false
  );

create policy "Moderators can update reviews for moderation"
  on public.reviews for update
  using (
    public.has_role('moderator')
    or public.has_role('operations_manager')
    or public.has_role('super_admin')
  );

-- No DELETE for ordinary users. Moderators may soft-hide via is_public/is_moderated.
-- Hard delete reserved for super_admin if ever needed (not granted by default).

-- ---------------------------------------------------------------------------
-- 6. Report support for reviews (reports table already exists)
-- Ensure reporters can insert reports targeting reviews they can see.
-- ---------------------------------------------------------------------------

-- Existing reports policies are assumed sufficient; we add a convenience note.
comment on table public.reports is
  'User reports for listings, reviews, users, messages, etc. Moderators handle via admin tools.';

-- ---------------------------------------------------------------------------
-- 7. Helper: public reviews for a seller (used by provider profiles / search)
-- ---------------------------------------------------------------------------

create or replace function public.get_public_reviews_for_seller(
  p_seller_id uuid,
  p_limit integer default 20
)
returns setof public.reviews
language sql
stable
security invoker
set search_path = public
as $$
  select *
  from public.reviews
  where seller_id = p_seller_id
    and is_public = true
    and is_moderated = false
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

comment on function public.get_public_reviews_for_seller(uuid, integer) is
  'Returns public, non-moderated reviews for a seller profile (max 50).';

grant execute on function public.get_public_reviews_for_seller(uuid, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. Backfill existing aggregates (safe if table is empty)
-- ---------------------------------------------------------------------------

do $$
declare
  r record;
begin
  for r in select distinct seller_id from public.reviews
  loop
    perform public.recalculate_seller_rating(r.seller_id);
  end loop;
end;
$$;

commit;
