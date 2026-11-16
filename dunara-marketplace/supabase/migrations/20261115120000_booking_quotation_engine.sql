-- Dúnarà Prompt 7: atomic booking and quotation lifecycle (hardened).
-- All status and quote mutations go through SECURITY DEFINER RPCs.
-- Authenticated clients cannot directly change status, quotes, or history.
-- Fixes applied from independent review:
--   - Drop legacy trigger-based enforcement and history path (single source of truth)
--   - Admin-only exit from disputed
--   - Auto-withdraw prior pending quotes when a new quote is sent
--   - Seller owns confirmation / delivery progression after acceptance
--   - Exactly one history row per transition (written only by RPC)

begin;

-- ---------------------------------------------------------------------------
-- 1. Remove previous broad UPDATE policies and legacy enforcement
-- ---------------------------------------------------------------------------

drop policy if exists "Participants can update relevant booking fields" on public.bookings;
drop policy if exists "Sellers and buyers can update quote status" on public.booking_quotes;

-- Drop the Phase 2.1 trigger-based transition guard. RPCs are now authoritative.
drop trigger if exists enforce_booking_status_transition_trigger on public.bookings;
drop function if exists public.enforce_booking_status_transition();

-- Drop the original AFTER UPDATE history trigger so history is written only by RPCs.
-- This prevents duplicate history rows.
drop trigger if exists booking_status_change_trigger on public.bookings;
-- Keep the helper function body available only if needed elsewhere; it is no longer attached.
-- drop function if exists public.record_booking_status_change();  -- left in place but unused

-- Narrow UPDATE policy: participants may still edit non-workflow fields.
create policy "Participants update booking non-workflow fields only"
on public.bookings for update
using (buyer_id = auth.uid() or public.owns_seller_profile(seller_id) or public.is_admin())
with check (buyer_id = auth.uid() or public.owns_seller_profile(seller_id) or public.is_admin());

-- Column grants prevent status, ownership, and lifecycle timestamps from being
-- changed directly. RPCs execute as SECURITY DEFINER and bypass these grants.
revoke update on public.bookings from authenticated;
grant update (
  title, description, preferred_date, preferred_time_start, preferred_time_end,
  location_text, location_state, location_city, buyer_notes, seller_notes
) on public.bookings to authenticated;

-- Quote rows and history are immutable to clients; only RPCs may write them.
revoke insert, update, delete on public.booking_quotes from authenticated;
revoke insert, update, delete on public.booking_status_history from authenticated;

-- ---------------------------------------------------------------------------
-- 2. Pure transition matrix (UI mirror lives in TypeScript)
-- ---------------------------------------------------------------------------

create or replace function public.booking_transition_allowed(
  p_from public.booking_status,
  p_to   public.booking_status
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case p_from
    when 'requested' then
      p_to in ('quoted', 'accepted', 'declined', 'cancelled', 'disputed')
    when 'quoted' then
      p_to in ('accepted', 'declined', 'cancelled', 'disputed')
    when 'accepted' then
      p_to in ('awaiting_confirmation', 'confirmed', 'cancelled', 'disputed')
    when 'awaiting_confirmation' then
      p_to in ('confirmed', 'cancelled', 'disputed')
    when 'confirmed' then
      p_to in ('in_progress', 'cancelled', 'disputed')
    when 'in_progress' then
      p_to in ('completed', 'cancelled', 'disputed')
    when 'disputed' then
      -- Only admins may leave disputed (enforced in booking_transition, not here)
      p_to in ('confirmed', 'in_progress', 'completed', 'cancelled')
    else false
  end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Core transition helper — single source of truth for status + history
-- ---------------------------------------------------------------------------

create or replace function public.booking_transition(
  p_booking_id uuid,
  p_to         public.booking_status,
  p_notes      text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  b           public.bookings;
  old_status  public.booking_status;
  actor       uuid := auth.uid();
  seller_user uuid;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into b
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;

  old_status := b.status;

  select user_id into seller_user
  from public.seller_profiles
  where id = b.seller_id;

  -- Participant or admin only
  if actor <> b.buyer_id and actor <> seller_user and not public.is_admin() then
    raise exception 'Not a booking participant' using errcode = '42501';
  end if;

  -- Matrix check
  if not public.booking_transition_allowed(old_status, p_to) then
    raise exception 'Invalid booking transition: % -> %', old_status, p_to
      using errcode = '23514';
  end if;

  -- Dispute exit is admin-only
  if old_status = 'disputed' and not public.is_admin() then
    raise exception 'Only administrators can resolve a disputed booking'
      using errcode = '42501';
  end if;

  -- Seller-owned progression after acceptance
  if p_to in ('quoted', 'awaiting_confirmation', 'confirmed', 'in_progress', 'completed')
     and actor <> seller_user
     and not public.is_admin() then
    raise exception 'Seller action required' using errcode = '42501';
  end if;

  -- Buyer must respond to a quote
  if p_to in ('accepted', 'declined')
     and old_status = 'quoted'
     and actor <> b.buyer_id
     and not public.is_admin() then
    raise exception 'Buyer response required' using errcode = '42501';
  end if;

  -- Seller must respond to a fresh request (accept / decline)
  if p_to in ('accepted', 'declined')
     and old_status = 'requested'
     and actor <> seller_user
     and not public.is_admin() then
    raise exception 'Seller response required' using errcode = '42501';
  end if;

  -- Cancel: any participant or admin
  if p_to = 'cancelled'
     and actor not in (b.buyer_id, seller_user)
     and not public.is_admin() then
    raise exception 'Only participants can cancel' using errcode = '42501';
  end if;

  -- Dispute can be raised by either participant
  if p_to = 'disputed'
     and actor not in (b.buyer_id, seller_user)
     and not public.is_admin() then
    raise exception 'Only participants can raise a dispute' using errcode = '42501';
  end if;

  update public.bookings
  set
    status       = p_to,
    completed_at = case when p_to = 'completed' then now() else completed_at end,
    cancelled_at = case when p_to = 'cancelled' then now() else cancelled_at end,
    updated_at   = now()
  where id = p_booking_id
  returning * into b;

  -- Single history row written exclusively by this function
  insert into public.booking_status_history (
    booking_id, from_status, to_status, changed_by, notes
  ) values (
    b.id, old_status, p_to, actor, p_notes
  );

  return b;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Send quotation (seller only) — withdraws any prior pending quotes
-- ---------------------------------------------------------------------------

create or replace function public.booking_send_quote(
  p_booking_id   uuid,
  p_amount_kobo  integer,
  p_description  text default null,
  p_valid_until  timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  b           public.bookings;
  seller_user uuid;
  qid         uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_amount_kobo is null or p_amount_kobo < 0 then
    raise exception 'Quote amount must be non-negative kobo' using errcode = '23514';
  end if;

  select * into b
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;

  select user_id into seller_user
  from public.seller_profiles
  where id = b.seller_id;

  if auth.uid() <> seller_user then
    raise exception 'Seller only' using errcode = '42501';
  end if;

  if b.status not in ('requested', 'quoted') then
    raise exception 'Booking cannot be quoted in this status' using errcode = '23514';
  end if;

  if p_valid_until is not null and p_valid_until <= now() then
    raise exception 'Quote expiry must be in the future' using errcode = '23514';
  end if;

  -- Withdraw any existing pending quotes for this booking (single live quote)
  update public.booking_quotes
  set status = 'withdrawn', updated_at = now()
  where booking_id = b.id
    and status = 'pending';

  insert into public.booking_quotes (
    booking_id, seller_id, amount_kobo, description, valid_until, status
  ) values (
    b.id, b.seller_id, p_amount_kobo, p_description, p_valid_until, 'pending'
  )
  returning id into qid;

  if b.status <> 'quoted' then
    perform public.booking_transition(b.id, 'quoted', 'Seller sent quotation');
  end if;

  return qid;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Buyer responds to a specific quote
-- ---------------------------------------------------------------------------

create or replace function public.booking_respond_quote(
  p_quote_id uuid,
  p_accept   boolean
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  q      public.booking_quotes;
  b      public.bookings;
  target public.booking_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into q
  from public.booking_quotes
  where id = p_quote_id
  for update;

  if not found then
    raise exception 'Quote not found' using errcode = 'P0002';
  end if;

  select * into b
  from public.bookings
  where id = q.booking_id
  for update;

  if auth.uid() <> b.buyer_id then
    raise exception 'Buyer only' using errcode = '42501';
  end if;

  if q.status <> 'pending' or b.status <> 'quoted' then
    raise exception 'Quote is no longer pending' using errcode = '23514';
  end if;

  if q.valid_until is not null and q.valid_until <= now() then
    update public.booking_quotes
    set status = 'expired', updated_at = now()
    where id = q.id;
    raise exception 'Quote has expired' using errcode = '23514';
  end if;

  update public.booking_quotes
  set
    status     = case when p_accept
                      then 'accepted'::public.quote_status
                      else 'rejected'::public.quote_status end,
    updated_at = now()
  where id = q.id;

  target := case when p_accept
                 then 'accepted'::public.booking_status
                 else 'declined'::public.booking_status end;

  return public.booking_transition(
    b.id,
    target,
    case when p_accept then 'Buyer accepted quotation' else 'Buyer declined quotation' end
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Seller accepts or declines a fresh request (requested status only)
-- ---------------------------------------------------------------------------

create or replace function public.booking_seller_decision(
  p_booking_id uuid,
  p_accept     boolean,
  p_notes      text default null
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  b           public.bookings;
  seller_user uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into b
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'Booking not found' using errcode = 'P0002';
  end if;

  select user_id into seller_user
  from public.seller_profiles
  where id = b.seller_id;

  if auth.uid() <> seller_user then
    raise exception 'Seller only' using errcode = '42501';
  end if;

  if b.status <> 'requested' then
    raise exception 'Only new requests can be accepted or declined' using errcode = '23514';
  end if;

  -- For quotation-type requests, accepting still moves to accepted;
  -- buyer confirmation of commercial terms happens via the quote flow when a quote is sent.
  return public.booking_transition(
    b.id,
    case when p_accept then 'accepted'::public.booking_status else 'declined'::public.booking_status end,
    p_notes
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Availability conflict guard (preferred window only — V1 limitation)
-- ---------------------------------------------------------------------------

create or replace function public.booking_check_availability()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status in ('confirmed', 'in_progress')
     and new.preferred_date is not null
     and new.preferred_time_start is not null
     and new.preferred_time_end is not null then

    if new.preferred_time_end <= new.preferred_time_start then
      raise exception 'End time must be after start time' using errcode = '23514';
    end if;

    if exists (
      select 1
      from public.bookings x
      where x.id <> new.id
        and x.seller_id = new.seller_id
        and x.preferred_date = new.preferred_date
        and x.status in ('confirmed', 'in_progress')
        and x.preferred_time_start < new.preferred_time_end
        and x.preferred_time_end > new.preferred_time_start
    ) then
      raise exception 'Seller has an availability conflict' using errcode = '23P01';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_availability_conflict on public.bookings;
create trigger bookings_availability_conflict
  before insert or update of status, preferred_date, preferred_time_start, preferred_time_end
  on public.bookings
  for each row
  execute function public.booking_check_availability();

-- ---------------------------------------------------------------------------
-- 8. In-app notifications on status change (no payments)
-- ---------------------------------------------------------------------------

create or replace function public.booking_notify_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seller_user uuid;
  recipient   uuid;
  msg         text;
begin
  if new.status is distinct from old.status then
    select user_id into seller_user
    from public.seller_profiles
    where id = new.seller_id;

    msg := 'Booking ' || new.reference_code || ' changed to ' || new.status::text;

    foreach recipient in array array[new.buyer_id, seller_user]
    loop
      if recipient is not null and recipient <> auth.uid() then
        insert into public.notifications (user_id, type, title, body, data, channel)
        values (
          recipient,
          'booking_status',
          'Booking update',
          msg,
          jsonb_build_object('booking_id', new.id, 'status', new.status),
          'in_app'
        );
      end if;
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists bookings_notify_status on public.bookings;
create trigger bookings_notify_status
  after update of status on public.bookings
  for each row
  execute function public.booking_notify_status();

-- ---------------------------------------------------------------------------
-- 9. Grants
-- ---------------------------------------------------------------------------

grant execute on function public.booking_transition(uuid, public.booking_status, text) to authenticated;
grant execute on function public.booking_send_quote(uuid, integer, text, timestamptz) to authenticated;
grant execute on function public.booking_respond_quote(uuid, boolean) to authenticated;
grant execute on function public.booking_seller_decision(uuid, boolean, text) to authenticated;
grant execute on function public.booking_transition_allowed(public.booking_status, public.booking_status) to authenticated;

commit;
