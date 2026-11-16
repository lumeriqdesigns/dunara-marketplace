-- Dúnarà Prompt 9: notification engine.
-- In-app is the durable record. Email/push are best-effort deliveries.
-- Core marketplace works when external providers are unavailable.
-- Deduplication, delivery status, retries, and preference checks are enforced here.

begin;

-- ---------------------------------------------------------------------------
-- 1. Extend notifications for delivery tracking + dedupe
-- ---------------------------------------------------------------------------

alter table public.notifications
  add column if not exists dedupe_key text,
  add column if not exists delivery_status text not null default 'delivered'
    check (delivery_status in ('pending', 'delivered', 'failed', 'skipped')),
  add column if not exists delivery_attempts integer not null default 0
    check (delivery_attempts >= 0),
  add column if not exists last_attempt_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists last_error text;

-- One notification per user + dedupe key (when key is provided).
create unique index if not exists notifications_user_dedupe_unique
  on public.notifications (user_id, dedupe_key)
  where dedupe_key is not null;

create index if not exists idx_notifications_pending
  on public.notifications (delivery_status, created_at)
  where delivery_status in ('pending', 'failed');

comment on column public.notifications.dedupe_key is
  'Stable key e.g. booking_status:{booking_id}:{status} to prevent duplicate events.';
comment on column public.notifications.delivery_status is
  'in_app rows are delivered immediately; external channels may be pending/failed.';

-- ---------------------------------------------------------------------------
-- 2. Expand preferences with per-event toggles (channel defaults remain)
-- ---------------------------------------------------------------------------

alter table public.notification_preferences
  add column if not exists booking_updates boolean not null default true,
  add column if not exists message_updates boolean not null default true,
  add column if not exists verification_updates boolean not null default true,
  add column if not exists review_updates boolean not null default true,
  add column if not exists marketing_email boolean not null default false;

-- ---------------------------------------------------------------------------
-- 3. External delivery attempts (email / push / telegram)
-- ---------------------------------------------------------------------------

create table if not exists public.notification_deliveries (
  id              uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  channel         public.notification_channel not null,
  status          text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  attempts        integer not null default 0 check (attempts >= 0),
  max_attempts    integer not null default 3 check (max_attempts >= 1),
  last_attempt_at timestamptz,
  next_attempt_at timestamptz,
  provider        text,
  provider_ref    text,
  last_error      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_notification_deliveries_pending
  on public.notification_deliveries (status, next_attempt_at)
  where status in ('pending', 'failed');

create index if not exists idx_notification_deliveries_notification
  on public.notification_deliveries (notification_id);

alter table public.notification_deliveries enable row level security;

-- Users can see delivery status for their own notifications (no secrets).
create policy "Users view own notification deliveries"
on public.notification_deliveries for select
using (
  exists (
    select 1 from public.notifications n
    where n.id = notification_id and n.user_id = auth.uid()
  )
  or public.is_admin()
);

-- Inserts/updates only via SECURITY DEFINER functions.
revoke insert, update, delete on public.notification_deliveries from authenticated, anon;

-- ---------------------------------------------------------------------------
-- 4. Event type → preference column mapping
-- ---------------------------------------------------------------------------

create or replace function public.notification_event_allowed(
  p_user_id uuid,
  p_type text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  prefs public.notification_preferences%rowtype;
begin
  select * into prefs
  from public.notification_preferences
  where user_id = p_user_id;

  -- Missing prefs row: allow essential events (defaults on signup should exist).
  if not found then
    return p_type not in ('marketing', 'promo');
  end if;

  case
    when p_type in (
      'new_booking', 'booking_status', 'booking_accepted', 'booking_declined',
      'new_quotation', 'quotation_accepted', 'booking_rescheduled',
      'booking_completed'
    ) then
      return prefs.booking_updates;
    when p_type in ('new_message') then
      return prefs.message_updates;
    when p_type in ('verification_result', 'verification_approved', 'verification_rejected') then
      return prefs.verification_updates;
    when p_type in ('new_review') then
      return prefs.review_updates;
    when p_type in ('marketing', 'promo') then
      return prefs.marketing_enabled and prefs.marketing_email;
    else
      return true; -- unknown types: allow (safe default for operational alerts)
  end case;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Central notify function — in-app + optional external delivery rows
-- ---------------------------------------------------------------------------

create or replace function public.notify_user(
  p_user_id    uuid,
  p_type       text,
  p_title      text,
  p_body       text default null,
  p_data       jsonb default '{}'::jsonb,
  p_dedupe_key text default null,
  p_channels   public.notification_channel[] default array['in_app']::public.notification_channel[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  nid uuid;
  prefs public.notification_preferences%rowtype;
  ch public.notification_channel;
  want_email boolean := false;
  want_push boolean := false;
  sanitized_body text;
begin
  if p_user_id is null or p_type is null or p_title is null then
    raise exception 'user_id, type and title are required' using errcode = '23514';
  end if;

  if not public.notification_event_allowed(p_user_id, p_type) then
    return null; -- preference opted out
  end if;

  -- Protect sensitive content: truncate body for storage; never store secrets in data.
  sanitized_body := left(coalesce(p_body, ''), 500);

  -- Dedupe: if key exists, return existing notification id.
  if p_dedupe_key is not null then
    select id into nid
    from public.notifications
    where user_id = p_user_id and dedupe_key = p_dedupe_key
    limit 1;
    if nid is not null then
      return nid;
    end if;
  end if;

  insert into public.notifications (
    user_id, type, title, body, data, channel,
    dedupe_key, delivery_status, delivery_attempts, delivered_at
  ) values (
    p_user_id, p_type, left(p_title, 200), sanitized_body, coalesce(p_data, '{}'::jsonb),
    'in_app',
    p_dedupe_key, 'delivered', 1, now()
  )
  returning id into nid;

  select * into prefs from public.notification_preferences where user_id = p_user_id;

  if found then
    want_email := prefs.email_enabled;
    want_push := prefs.push_enabled;
  else
    want_email := true;
    want_push := true;
  end if;

  -- Queue external deliveries when channel requested and preference allows.
  foreach ch in array p_channels
  loop
    if ch = 'in_app' then
      continue;
    elsif ch = 'email' and want_email then
      insert into public.notification_deliveries (
        notification_id, channel, status, attempts, next_attempt_at, provider
      ) values (
        nid, 'email', 'pending', 0, now(), 'email_provider'
      );
    elsif ch = 'push' and want_push then
      insert into public.notification_deliveries (
        notification_id, channel, status, attempts, next_attempt_at, provider
      ) values (
        nid, 'push', 'pending', 0, now(), 'web_push'
      );
    elsif ch = 'telegram' and found and prefs.telegram_enabled then
      insert into public.notification_deliveries (
        notification_id, channel, status, attempts, next_attempt_at, provider
      ) values (
        nid, 'telegram', 'pending', 0, now(), 'telegram_bot'
      );
    end if;
  end loop;

  return nid;
exception
  when unique_violation then
    -- Race on dedupe_key: return existing
    select id into nid
    from public.notifications
    where user_id = p_user_id and dedupe_key = p_dedupe_key
    limit 1;
    return nid;
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Claim pending deliveries for a worker (skip locked)
-- ---------------------------------------------------------------------------

create or replace function public.notification_claim_pending(p_limit integer default 20)
returns setof public.notification_deliveries
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only callable from trusted contexts (service role / edge). Still SECURITY DEFINER.
  return query
  with cte as (
    select d.id
    from public.notification_deliveries d
    where d.status in ('pending', 'failed')
      and d.attempts < d.max_attempts
      and (d.next_attempt_at is null or d.next_attempt_at <= now())
    order by d.created_at
    limit greatest(1, least(p_limit, 100))
    for update skip locked
  )
  update public.notification_deliveries d
  set
    attempts = d.attempts + 1,
    last_attempt_at = now(),
    updated_at = now()
  from cte
  where d.id = cte.id
  returning d.*;
end;
$$;

-- Record delivery outcome
create or replace function public.notification_mark_delivery(
  p_delivery_id uuid,
  p_success     boolean,
  p_error       text default null,
  p_provider_ref text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d public.notification_deliveries;
  backoff interval;
begin
  select * into d from public.notification_deliveries where id = p_delivery_id for update;
  if not found then
    raise exception 'Delivery not found' using errcode = 'P0002';
  end if;

  if p_success then
    update public.notification_deliveries
    set status = 'sent',
        last_error = null,
        provider_ref = coalesce(p_provider_ref, provider_ref),
        updated_at = now()
    where id = p_delivery_id;
  else
    backoff := (interval '1 minute') * (2 ^ least(d.attempts, 5)); -- exponential backoff
    update public.notification_deliveries
    set status = case when d.attempts >= d.max_attempts then 'failed' else 'pending' end,
        last_error = left(coalesce(p_error, 'unknown'), 500),
        next_attempt_at = case
          when d.attempts >= d.max_attempts then null
          else now() + backoff
        end,
        updated_at = now()
    where id = p_delivery_id;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Wire existing booking / messaging notification paths through notify_user
-- ---------------------------------------------------------------------------

create or replace function public.booking_notify_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seller_user uuid;
  recipient uuid;
  event_type text;
  title text;
  body text;
  dedupe text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  select user_id into seller_user
  from public.seller_profiles
  where id = new.seller_id;

  event_type := case new.status
    when 'accepted' then 'booking_accepted'
    when 'declined' then 'booking_declined'
    when 'quoted' then 'new_quotation'
    when 'completed' then 'booking_completed'
    else 'booking_status'
  end;

  title := 'Booking update';
  body := 'Booking ' || coalesce(new.reference_code, '') || ' is now ' || new.status::text;
  dedupe := 'booking_status:' || new.id::text || ':' || new.status::text;

  foreach recipient in array array[new.buyer_id, seller_user]
  loop
    if recipient is not null and recipient is distinct from auth.uid() then
      perform public.notify_user(
        recipient,
        event_type,
        title,
        body,
        jsonb_build_object('booking_id', new.id, 'status', new.status),
        dedupe || ':' || recipient::text,
        array['in_app', 'email', 'push']::public.notification_channel[]
      );
    end if;
  end loop;

  return new;
end;
$$;

-- Messaging send already inserts notifications directly; replace with notify_user
-- by updating messaging_send_message in a compatible way (redefine notification loop).

create or replace function public.messaging_send_message(
  p_conversation_id uuid,
  p_body            text,
  p_client_id       text default null
)
returns public.messages
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  msg   public.messages;
  recipient uuid;
  trimmed text;
  safe_client_id text;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not public.is_conversation_member(p_conversation_id) then
    raise exception 'Not a conversation member' using errcode = '42501';
  end if;

  if not public.messaging_rate_limit_ok(actor) then
    raise exception 'Rate limit exceeded. Please wait a moment.' using errcode = '54000';
  end if;

  trimmed := nullif(trim(p_body), '');
  if trimmed is null or length(trimmed) > 8000 then
    raise exception 'Message body must be 1–8000 characters' using errcode = '23514';
  end if;

  safe_client_id := nullif(trim(p_client_id), '');
  if safe_client_id is not null and length(safe_client_id) > 128 then
    raise exception 'client_id too long' using errcode = '23514';
  end if;

  if safe_client_id is not null then
    select * into msg
    from public.messages
    where conversation_id = p_conversation_id
      and sender_id = actor
      and client_id = safe_client_id
    limit 1;
    if found then
      return msg;
    end if;
  end if;

  insert into public.messages (conversation_id, sender_id, body, client_id, is_system)
  values (p_conversation_id, actor, trimmed, safe_client_id, false)
  returning * into msg;

  update public.conversations
  set last_message_at = msg.created_at, updated_at = now()
  where id = p_conversation_id;

  for recipient in
    select user_id from public.conversation_members
    where conversation_id = p_conversation_id and user_id <> actor
  loop
    perform public.notify_user(
      recipient,
      'new_message',
      'New message',
      left(trimmed, 120),
      jsonb_build_object(
        'conversation_id', p_conversation_id,
        'message_id', msg.id
      ),
      'message:' || msg.id::text || ':' || recipient::text,
      array['in_app', 'push']::public.notification_channel[]
    );
  end loop;

  return msg;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Grants
-- ---------------------------------------------------------------------------

grant execute on function public.notify_user(uuid, text, text, text, jsonb, text, public.notification_channel[]) to authenticated;
grant execute on function public.notification_event_allowed(uuid, text) to authenticated;
-- Claim/mark are for workers; still grant to authenticated is unnecessary — revoke from public.
revoke all on function public.notification_claim_pending(integer) from public, anon, authenticated;
revoke all on function public.notification_mark_delivery(uuid, boolean, text, text) from public, anon, authenticated;
-- Service role bypasses grants; edge functions use service role.

commit;
