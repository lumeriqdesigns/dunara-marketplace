-- Dúnarà Prompt 9.1: notification engine hardening (independent review).
-- - Revoke client execute on notify_user (triggers / service_role only)
-- - Allow-list event types (unknown → deny)
-- - Narrow UPDATE grants on notifications (is_read, read_at only)
-- - Cap p_data size
-- - Push endpoint ownership protection
-- - Simple notify rate limit per recipient window

begin;

-- ---------------------------------------------------------------------------
-- 1. Revoke client execute on privileged writer
-- ---------------------------------------------------------------------------

revoke execute on function public.notify_user(uuid, text, text, text, jsonb, text, public.notification_channel[])
  from public, anon, authenticated;

-- notification_event_allowed is read-only helper; keep executable for app diagnostics if needed.
-- Claim/mark already revoked in prior migration.

-- ---------------------------------------------------------------------------
-- 2. Allow-list event types + data size cap + rate limit inside notify_user
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
  -- Unknown types are denied (allow-list only).
  if p_type not in (
    'new_booking', 'booking_status', 'booking_accepted', 'booking_declined',
    'new_quotation', 'quotation_accepted', 'booking_rescheduled', 'booking_completed',
    'new_message',
    'verification_result', 'verification_approved', 'verification_rejected',
    'new_review',
    'marketing', 'promo'
  ) then
    return false;
  end if;

  select * into prefs
  from public.notification_preferences
  where user_id = p_user_id;

  if not found then
    return p_type not in ('marketing', 'promo');
  end if;

  case
    when p_type in (
      'new_booking', 'booking_status', 'booking_accepted', 'booking_declined',
      'new_quotation', 'quotation_accepted', 'booking_rescheduled', 'booking_completed'
    ) then
      return prefs.booking_updates;
    when p_type = 'new_message' then
      return prefs.message_updates;
    when p_type in ('verification_result', 'verification_approved', 'verification_rejected') then
      return prefs.verification_updates;
    when p_type = 'new_review' then
      return prefs.review_updates;
    when p_type in ('marketing', 'promo') then
      return prefs.marketing_enabled and prefs.marketing_email;
    else
      return false;
  end case;
end;
$$;

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
  recent_count integer;
  data_obj jsonb;
begin
  if p_user_id is null or p_type is null or p_title is null then
    raise exception 'user_id, type and title are required' using errcode = '23514';
  end if;

  if not public.notification_event_allowed(p_user_id, p_type) then
    return null;
  end if;

  -- Cap JSON payload size (~4 KiB)
  data_obj := coalesce(p_data, '{}'::jsonb);
  if pg_column_size(data_obj) > 4096 then
    raise exception 'notification data too large' using errcode = '23514';
  end if;

  -- Soft rate limit: max 60 notifications per recipient per minute (all types)
  select count(*) into recent_count
  from public.notifications
  where user_id = p_user_id
    and created_at > now() - interval '1 minute';
  if recent_count >= 60 then
    raise exception 'Notification rate limit exceeded' using errcode = '54000';
  end if;

  sanitized_body := left(coalesce(p_body, ''), 500);

  if p_dedupe_key is not null then
    if length(p_dedupe_key) > 200 then
      raise exception 'dedupe_key too long' using errcode = '23514';
    end if;
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
    p_user_id, p_type, left(p_title, 200), sanitized_body, data_obj,
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
    select id into nid
    from public.notifications
    where user_id = p_user_id and dedupe_key = p_dedupe_key
    limit 1;
    return nid;
end;
$$;

-- Ensure execute stays revoked after replace
revoke execute on function public.notify_user(uuid, text, text, text, jsonb, text, public.notification_channel[])
  from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Narrow UPDATE on notifications (read state only)
-- ---------------------------------------------------------------------------

drop policy if exists "Users can update their own notifications (read status)" on public.notifications;

revoke update on public.notifications from authenticated;
grant update (is_read, read_at) on public.notifications to authenticated;

create policy "Users can update their own notification read state"
on public.notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 4. Push subscription ownership — block cross-user endpoint steals
-- ---------------------------------------------------------------------------

create or replace function public.push_subscription_ownership_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_owner uuid;
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    if new.user_id is distinct from auth.uid() and not public.is_admin() then
      -- When called from client JWT; service role has auth.uid() null — allow system ops
      if auth.uid() is not null then
        raise exception 'Cannot register push subscription for another user'
          using errcode = '42501';
      end if;
    end if;

    select user_id into existing_owner
    from public.push_subscriptions
    where endpoint = new.endpoint
      and user_id is distinct from new.user_id
    limit 1;

    if existing_owner is not null then
      raise exception 'Endpoint already registered to another account'
        using errcode = '23505';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists push_subscription_ownership_guard on public.push_subscriptions;
create trigger push_subscription_ownership_guard
  before insert or update on public.push_subscriptions
  for each row
  execute function public.push_subscription_ownership_guard();

-- Composite uniqueness helps app-level upserts per user
create unique index if not exists push_subscriptions_user_endpoint_unique
  on public.push_subscriptions (user_id, endpoint);

commit;
