-- Dúnarà Prompt 8 hardening (independent review corrections).
-- Makes message writes RPC-only, restricts conversation starts, real idempotency,
-- volatile rate limit, admin-safe soft-delete policy, storage bootstrap notes.

begin;

-- ---------------------------------------------------------------------------
-- 1. Message INSERT is RPC-only (mirror booking engine)
-- ---------------------------------------------------------------------------

drop policy if exists "Members can send messages" on public.messages;
revoke insert on public.messages from authenticated;

-- Soft-delete / edit: sender or admin; WITH CHECK allows both.
drop policy if exists "Senders can soft-delete or edit their messages" on public.messages;
create policy "Senders can soft-delete or edit their messages"
on public.messages for update
using (sender_id = auth.uid() or public.is_admin())
with check (sender_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Optional client_id for real idempotency
-- ---------------------------------------------------------------------------

alter table public.messages
  add column if not exists client_id text;

-- One successful send per (conversation, sender, client_id) when client_id is set.
create unique index if not exists messages_client_id_unique
  on public.messages (conversation_id, sender_id, client_id)
  where client_id is not null;

comment on column public.messages.client_id is
  'Optional client-supplied idempotency key. Unique per conversation+sender when present.';

-- ---------------------------------------------------------------------------
-- 3. Rate-limit helper: VOLATILE (reads live row counts)
-- ---------------------------------------------------------------------------

create or replace function public.messaging_rate_limit_ok(p_user_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.messages
  where sender_id = p_user_id
    and created_at > now() - interval '60 seconds';
  return recent_count < 30;
end;
$$;

-- Conversation creation rate limit: max 10 new conversations per user per hour.
create or replace function public.messaging_conversation_rate_limit_ok(p_user_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  select count(*) into recent_count
  from public.conversation_members cm
  join public.conversations c on c.id = cm.conversation_id
  where cm.user_id = p_user_id
    and c.created_at > now() - interval '1 hour';
  return recent_count < 10;
end;
$$;

-- Helpful index for message rate-limit window scans.
create index if not exists idx_messages_sender_created
  on public.messages (sender_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 4. Hardened start conversation
--    - other user must exist in profiles
--    - with booking: both must be booking participants (unchanged)
--    - without booking: other user must own an active seller profile
--      (marketplace relationship: buyer/seller contact path)
--    - rate-limit new conversations
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
  other_exists boolean;
  other_is_seller boolean;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_other_user_id is null or p_other_user_id = actor then
    raise exception 'Invalid conversation partner' using errcode = '23514';
  end if;

  select exists(select 1 from public.profiles p where p.id = p_other_user_id)
  into other_exists;
  if not other_exists then
    raise exception 'Conversation partner not found' using errcode = 'P0002';
  end if;

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

    select c.id into existing_id
    from public.conversations c
    where c.booking_id = p_booking_id
    limit 1;

    if existing_id is not null then
      return existing_id;
    end if;
  else
    -- Non-booking path: other party must be an active seller (marketplace contact).
    select exists(
      select 1 from public.seller_profiles sp
      where sp.user_id = p_other_user_id
        and sp.is_active = true
    ) into other_is_seller;

    if not other_is_seller then
      raise exception 'You can only message active sellers outside of a booking'
        using errcode = '42501';
    end if;

    -- Reuse existing 1:1 (no booking) between the two users.
    select c.id into existing_id
    from public.conversations c
    join public.conversation_members m1
      on m1.conversation_id = c.id and m1.user_id = actor
    join public.conversation_members m2
      on m2.conversation_id = c.id and m2.user_id = p_other_user_id
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

  if not public.messaging_conversation_rate_limit_ok(actor) then
    raise exception 'Conversation rate limit exceeded. Try again later.'
      using errcode = '54000';
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
-- 5. Hardened send message — store client_id, rely on unique index for idempotency
-- ---------------------------------------------------------------------------

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

  -- Real idempotency: return existing row if same client_id already stored.
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
-- 6. Grants for new helper
-- ---------------------------------------------------------------------------

grant execute on function public.messaging_conversation_rate_limit_ok(uuid) to authenticated;
grant execute on function public.messaging_rate_limit_ok(uuid) to authenticated;
grant execute on function public.messaging_start_conversation(uuid, uuid, text) to authenticated;
grant execute on function public.messaging_send_message(uuid, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. Storage bootstrap (private message-attachments bucket)
--    Supabase storage schema may differ by project version; this is best-effort.
--    If storage.buckets is unavailable, create the bucket in the dashboard.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'storage' and table_name = 'buckets'
  ) then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'message-attachments',
      'message-attachments',
      false,
      5242880,
      array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    )
    on conflict (id) do update set
      public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  end if;
exception
  when others then
    raise notice 'Storage bucket bootstrap skipped: %', sqlerrm;
end;
$$;

-- Storage RLS policies (best-effort; dashboard may still be required).
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'storage' and table_name = 'objects'
  ) then
    -- Drop prior policies if re-running
    execute 'drop policy if exists "message_attachments_insert_own" on storage.objects';
    execute 'drop policy if exists "message_attachments_select_own" on storage.objects';
    execute 'drop policy if exists "message_attachments_no_public_select" on storage.objects';

    -- Upload only under own uid folder
    execute $pol$
      create policy "message_attachments_insert_own"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'message-attachments'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
    $pol$;

    -- No broad SELECT for authenticated — app uses signed URLs via service path
    -- or createSignedUrl after membership is verified at the DB layer.
    -- Allow owners to read their own objects (needed for createSignedUrl with user JWT).
    execute $pol$
      create policy "message_attachments_select_own"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'message-attachments'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
    $pol$;
  end if;
exception
  when others then
    raise notice 'Storage object policies skipped: %', sqlerrm;
end;
$$;

commit;
