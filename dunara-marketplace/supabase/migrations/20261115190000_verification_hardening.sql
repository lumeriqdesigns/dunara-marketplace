-- Dúnarà Prompt 10.1: verification hardening (independent review).
-- RPC-only status/decision writes; tightened document INSERT; reject clears badge
-- when no other approved application remains; open-application uniqueness; rate limit.

begin;

-- ---------------------------------------------------------------------------
-- 1. RPC-only material changes on provider_verifications
-- ---------------------------------------------------------------------------

drop policy if exists "Sellers update own editable applications" on public.provider_verifications;
drop policy if exists "Officers update verification applications" on public.provider_verifications;

revoke update on public.provider_verifications from authenticated, anon;
-- SELECT policies remain; all status/decision writes go through SECURITY DEFINER RPCs.

-- ---------------------------------------------------------------------------
-- 2. Seller submit RPC (create or move draft → submitted) + rate limit
-- ---------------------------------------------------------------------------

create or replace function public.verification_seller_submit(
  p_level public.verification_level
)
returns public.provider_verifications
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  seller uuid;
  existing public.provider_verifications;
  recent_count integer;
  result public.provider_verifications;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select id into seller
  from public.seller_profiles
  where user_id = actor
  limit 1;

  if seller is null then
    raise exception 'Seller profile required' using errcode = '42501';
  end if;

  -- Rate limit: max 5 applications created per seller per day
  select count(*) into recent_count
  from public.provider_verifications
  where seller_id = seller
    and created_at > now() - interval '1 day';
  if recent_count >= 5 then
    raise exception 'Verification application rate limit exceeded (max 5 per day)'
      using errcode = '54000';
  end if;

  -- Reuse open draft at this level
  select * into existing
  from public.provider_verifications
  where seller_id = seller
    and level = p_level
    and status = 'draft'
  order by created_at desc
  limit 1
  for update;

  if found then
    update public.provider_verifications
    set status = 'submitted', submitted_at = now(), updated_at = now()
    where id = existing.id
    returning * into result;
    return result;
  end if;

  -- Block if already open (submitted / under_review / additional_info_required)
  if exists (
    select 1 from public.provider_verifications
    where seller_id = seller
      and level = p_level
      and status in ('submitted', 'under_review', 'additional_info_required')
  ) then
    raise exception 'You already have an open application for this level'
      using errcode = '23505';
  end if;

  insert into public.provider_verifications (
    seller_id, level, status, submitted_at
  ) values (
    seller, p_level, 'submitted', now()
  )
  returning * into result;

  return result;
end;
$$;

grant execute on function public.verification_seller_submit(public.verification_level) to authenticated;

-- Resubmit already exists; keep grant
grant execute on function public.verification_seller_resubmit(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Harden officer decide — clear badge on reject when no other approval
-- ---------------------------------------------------------------------------

create or replace function public.verification_officer_decide(
  p_verification_id uuid,
  p_decision        text,
  p_notes           text default null,
  p_rejection_reason text default null,
  p_additional_info_request text default null
)
returns public.provider_verifications
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  v public.provider_verifications;
  new_status public.verification_status;
  seller_user uuid;
  other_approved boolean;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not (
    public.has_role('verification_officer')
    or public.has_role('super_admin')
  ) then
    raise exception 'Permission denied: verification_officer or super_admin required'
      using errcode = '42501';
  end if;

  select * into v
  from public.provider_verifications
  where id = p_verification_id
  for update;

  if not found then
    raise exception 'Verification application not found' using errcode = 'P0002';
  end if;

  select user_id into seller_user
  from public.seller_profiles
  where id = v.seller_id;

  if seller_user = actor then
    raise exception 'Officers cannot decide their own verification application'
      using errcode = '42501';
  end if;

  if p_decision = 'approve' then
    if v.status not in ('submitted', 'under_review', 'additional_info_required') then
      raise exception 'Application cannot be approved from status %', v.status
        using errcode = '23514';
    end if;
    new_status := 'approved';

    update public.provider_verifications
    set
      status = new_status,
      reviewed_at = now(),
      reviewed_by = actor,
      decision_notes = p_notes,
      rejection_reason = null,
      additional_info_request = null,
      updated_at = now()
    where id = v.id
    returning * into v;

    perform public.set_seller_verification(
      v.seller_id,
      true,
      v.level,
      coalesce(p_notes, 'Approved via verification application')
    );

  elsif p_decision = 'reject' then
    if v.status not in ('submitted', 'under_review', 'additional_info_required') then
      raise exception 'Application cannot be rejected from status %', v.status
        using errcode = '23514';
    end if;
    if p_rejection_reason is null or length(trim(p_rejection_reason)) < 3 then
      raise exception 'Rejection reason is required' using errcode = '23514';
    end if;
    new_status := 'rejected';

    update public.provider_verifications
    set
      status = new_status,
      reviewed_at = now(),
      reviewed_by = actor,
      decision_notes = p_notes,
      rejection_reason = left(trim(p_rejection_reason), 1000),
      updated_at = now()
    where id = v.id
    returning * into v;

    -- Clear public badge if no other approved application remains for this seller
    select exists (
      select 1 from public.provider_verifications
      where seller_id = v.seller_id
        and status = 'approved'
        and id is distinct from v.id
    ) into other_approved;

    if not other_approved then
      perform public.set_seller_verification(
        v.seller_id,
        false,
        null,
        coalesce(p_notes, 'Cleared after rejection; no other approved application')
      );
    end if;

  elsif p_decision = 'request_info' then
    if v.status not in ('submitted', 'under_review') then
      raise exception 'Can only request info from submitted/under_review'
        using errcode = '23514';
    end if;
    if p_additional_info_request is null or length(trim(p_additional_info_request)) < 3 then
      raise exception 'Additional info request text is required' using errcode = '23514';
    end if;
    new_status := 'additional_info_required';

    update public.provider_verifications
    set
      status = new_status,
      reviewed_at = now(),
      reviewed_by = actor,
      decision_notes = p_notes,
      additional_info_request = left(trim(p_additional_info_request), 2000),
      updated_at = now()
    where id = v.id
    returning * into v;

  elsif p_decision = 'under_review' then
    if v.status not in ('submitted', 'additional_info_required') then
      raise exception 'Cannot mark under_review from status %', v.status
        using errcode = '23514';
    end if;
    new_status := 'under_review';

    update public.provider_verifications
    set
      status = new_status,
      reviewed_by = actor,
      updated_at = now()
    where id = v.id
    returning * into v;

  else
    raise exception 'Invalid decision: %', p_decision using errcode = '23514';
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    'verification.' || p_decision,
    'provider_verifications',
    v.id,
    jsonb_build_object(
      'seller_id', v.seller_id,
      'level', v.level,
      'status', v.status,
      'notes', p_notes,
      'rejection_reason', p_rejection_reason
    )
  );

  if seller_user is not null then
    perform public.notify_user(
      seller_user,
      case p_decision
        when 'approve' then 'verification_approved'
        when 'reject' then 'verification_rejected'
        else 'verification_result'
      end,
      case p_decision
        when 'approve' then 'Verification approved'
        when 'reject' then 'Verification rejected'
        when 'request_info' then 'More information required'
        else 'Verification update'
      end,
      case p_decision
        when 'approve' then 'Your ' || v.level::text || ' verification was approved.'
        when 'reject' then left(coalesce(p_rejection_reason, 'Your application was rejected.'), 500)
        when 'request_info' then left(coalesce(p_additional_info_request, 'Please provide additional information.'), 500)
        else 'Your verification application status was updated.'
      end,
      jsonb_build_object(
        'verification_id', v.id,
        'status', v.status,
        'level', v.level
      ),
      'verification:' || v.id::text || ':' || v.status::text,
      array['in_app', 'email']::public.notification_channel[]
    );
  end if;

  return v;
end;
$$;

revoke all on function public.verification_officer_decide(uuid, text, text, text, text)
  from public, anon;
grant execute on function public.verification_officer_decide(uuid, text, text, text, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Document INSERT — only on editable applications
-- ---------------------------------------------------------------------------

drop policy if exists "Sellers can upload documents for their applications"
  on public.provider_documents;

create policy "Sellers can upload documents for editable applications"
on public.provider_documents for insert
with check (
  public.owns_seller_profile(seller_id)
  and uploaded_by = auth.uid()
  and exists (
    select 1 from public.provider_verifications v
    where v.id = verification_id
      and v.seller_id = seller_id
      and v.status in ('draft', 'submitted', 'additional_info_required')
  )
);

-- ---------------------------------------------------------------------------
-- 5. One open application per seller + level
-- ---------------------------------------------------------------------------

create unique index if not exists provider_verifications_one_open_per_level
  on public.provider_verifications (seller_id, level)
  where status in ('draft', 'submitted', 'under_review', 'additional_info_required');

-- ---------------------------------------------------------------------------
-- 6. Status trigger remains as defence in depth (sellers still blocked)
-- ---------------------------------------------------------------------------

create or replace function public.protect_verification_status_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if public.has_role('verification_officer')
       or public.has_role('super_admin')
       or auth.uid() is null then
      return new;
    end if;

    if public.owns_seller_profile(old.seller_id) then
      if old.status = 'draft' and new.status = 'submitted' then
        return new;
      end if;
      if old.status = 'additional_info_required' and new.status = 'submitted' then
        return new;
      end if;
    end if;

    raise exception 'Permission denied: invalid verification status change'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

commit;
