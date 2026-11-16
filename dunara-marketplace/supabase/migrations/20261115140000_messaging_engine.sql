-- Dúnarà Prompt 8: secure built-in messaging engine.
-- Conversations, messages, attachments, read state, notifications.
-- Mutations that touch multiple tables go through SECURITY DEFINER RPCs.
-- Private attachments live in a private storage bucket; clients receive signed URLs only.

begin;

-- ---------------------------------------------------------------------------
-- 1. Tighten conversation / member policies
-- ---------------------------------------------------------------------------

-- Anyone authenticated could previously insert an empty conversation.
-- Creation is now RPC-only (start_or_get_conversation).
drop policy if exists "Authenticated users can create conversations" on public.conversations;
revoke insert on public.conversations from authenticated;

-- Membership inserts were too open. Only RPCs (or admin) add members.
drop policy if exists "Users can join conversations they are added to" on public.conversation_members;
revoke insert, delete on public.conversation_members from authenticated;

-- Members may still update their own last_read_at / is_muted via RPC or narrow grant.
revoke update on public.conversation_members from authenticated;
grant update (last_read_at, is_muted) on public.conversation_members to authenticated;

create policy "Members update own membership row"
on public.conversation_members for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Messages: keep SELECT for members; INSERT only via RPC (or keep narrow insert with sender_id = auth.uid()).
-- We keep a narrow INSERT policy as defence in depth for simple text messages,
-- but the preferred path is messaging_send_message which also updates conversation + notifies.

drop policy if exists "Members can send messages" on public.messages;
create policy "Members can send messages"
on public.messages for insert
with check (
  sender_id = auth.uid()
  and public.is_conversation_member(conversation_id)
  and (body is not null and length(trim(body)) > 0 or is_system = true)
);

-- Soft-delete / edit: sender only, non-system messages.
drop policy if exists "Senders can soft-delete or edit their messages" on public.messages;
create policy "Senders can soft-delete or edit their messages"
on public.messages for update
using (sender_id = auth.uid() and is_system = false)
with check (sender_id = auth.uid());

-- Attachments remain member-readable; insert only by message sender.
-- (Policies already exist; leave SELECT/INSERT as defined in initial schema.)

-- ---------------------------------------------------------------------------
-- 2. Rate-limit helper (simple sliding window via recent message count)
-- ---------------------------------------------------------------------------

create or replace function public.messaging_rate_limit_ok(p_user_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  -- Max 30 messages per user in the last 60 seconds.
  select count(*) into recent_count
  from public.messages
  where sender_id = p_user_id
    and created_at > now() - interval '60 seconds';
  return recent_count < 30;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Start or get a 1:1 conversation between buyer and seller (optional booking)
-- ---------------------------------------------------------------------------

create or replace function public.messaging_start_conversation(
  p_other_user_id uuid,
  p_booking_id    uuid default null,
  p_subject       text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  existing_id uuid;
  new_id uuid;
  booking_buyer uuid;
  booking_seller_user uuid;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_other_user_id is null or p_other_user_id = actor then
    raise exception 'Invalid conversation partner' using errcode = '23514';
  end if;

  -- If linked to a booking, both parties must be the booking participants.
  if p_booking_id is not null then
    select b.buyer_id, sp.user_id
    into booking_buyer, booking_seller_user
    from public.bookings b
    join public.seller_profiles sp on sp.id = b.seller_id
    where b.id = p_booking_id;

    if booking_buyer is null then
      raise exception 'Booking not found' using errcode = 'P0002';
    end if;

    if actor not in (booking_buyer, booking_seller_user)
       or p_other_user_id not in (booking_buyer, booking_seller_user) then
      raise exception 'Not a booking participant' using errcode = '42501';
    end if;

    -- Reuse existing conversation for this booking if present.
    select c.id into existing_id
    from public.conversations c
    where c.booking_id = p_booking_id
    limit 1;

    if existing_id is not null then
      return existing_id;
    end if;
  else
    -- Reuse existing 1:1 conversation between the two users (no booking).
    select c.id into existing_id
    from public.conversations c
    join public.conversation_members m1 on m1.conversation_id = c.id and m1.user_id = actor
    join public.conversation_members m2 on m2.conversation_id = c.id and m2.user_id = p_other_user_id
    where c.booking_id is null
      and (
        select count(*) from public.conversation_members cm
        where cm.conversation_id = c.id
      ) = 2
    order by c.updated_at desc
    limit 1;

    if existing_id is not null then
      return existing_id;
    end if;
  end if;

  insert into public.conversations (booking_id, subject)
  values (p_booking_id, nullif(trim(p_subject), ''))
  returning id into new_id;

  insert into public.conversation_members (conversation_id, user_id)
  values
    (new_id, actor),
    (new_id, p_other_user_id);

  return new_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Send a text message (updates last_message_at, notifies other members)
-- ---------------------------------------------------------------------------

create or replace function public.messaging_send_message(
  p_conversation_id uuid,
  p_body            text,
  p_client_id       text default null  -- optional idempotency key from client
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

  -- Idempotency: if client_id provided and a recent message with same body+sender exists, return it.
  -- (Lightweight; full client_id column can be added later.)
  if p_client_id is not null then
    select * into msg
    from public.messages
    where conversation_id = p_conversation_id
      and sender_id = actor
      and body = trimmed
      and created_at > now() - interval '30 seconds'
    order by created_at desc
    limit 1;
    if found then
      return msg;
    end if;
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (p_conversation_id, actor, trimmed)
  returning * into msg;

  update public.conversations
  set last_message_at = msg.created_at, updated_at = now()
  where id = p_conversation_id;

  -- Notify other members (in-app).
  for recipient in
    select user_id from public.conversation_members
    where conversation_id = p_conversation_id and user_id <> actor
  loop
    insert into public.notifications (user_id, type, title, body, data, channel)
    values (
      recipient,
      'new_message',
      'New message',
      left(trimmed, 120),
      jsonb_build_object(
        'conversation_id', p_conversation_id,
        'message_id', msg.id
      ),
      'in_app'
    );
  end loop;

  return msg;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Mark conversation as read for the current user
-- ---------------------------------------------------------------------------

create or replace function public.messaging_mark_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not public.is_conversation_member(p_conversation_id) then
    raise exception 'Not a conversation member' using errcode = '42501';
  end if;

  update public.conversation_members
  set last_read_at = now()
  where conversation_id = p_conversation_id
    and user_id = auth.uid();
end;
$$;

-- ---------------------------------------------------------------------------
-- 6. Soft-delete own message
-- ---------------------------------------------------------------------------

create or replace function public.messaging_soft_delete_message(p_message_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.messages;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into m from public.messages where id = p_message_id for update;
  if not found then
    raise exception 'Message not found' using errcode = 'P0002';
  end if;

  if m.sender_id <> auth.uid() and not public.is_admin() then
    raise exception 'Only the sender can delete this message' using errcode = '42501';
  end if;

  update public.messages
  set deleted_at = now(), body = null
  where id = p_message_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Grants
-- ---------------------------------------------------------------------------

grant execute on function public.messaging_start_conversation(uuid, uuid, text) to authenticated;
grant execute on function public.messaging_send_message(uuid, text, text) to authenticated;
grant execute on function public.messaging_mark_read(uuid) to authenticated;
grant execute on function public.messaging_soft_delete_message(uuid) to authenticated;
grant execute on function public.messaging_rate_limit_ok(uuid) to authenticated;

-- Note: Storage bucket `message-attachments` (private) must be created in the
-- Supabase dashboard or via a storage migration. Policies:
--   - INSERT: authenticated, path prefix = auth.uid()::text || '/'
--   - SELECT: none for public; application issues signed URLs only
--   - Allowed MIME: image/jpeg, image/png, image/webp, application/pdf
--   - Max size: 5 MiB

commit;
