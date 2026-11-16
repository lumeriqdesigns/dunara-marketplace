-- Dúnarà Prompt 10: seller verification engine.
-- Sellers submit applications + private documents.
-- Only verification_officer / super_admin may decide.
-- Decisions audit-logged; profile flags set only via trusted path.
-- Badges reflect is_verified + verification_level from seller_profiles only.

begin;

-- ---------------------------------------------------------------------------
-- 1. Tighten seller UPDATE on applications — cannot self-approve
-- ---------------------------------------------------------------------------

drop policy if exists "Sellers can update their own draft/submitted verifications"
  on public.provider_verifications;

-- Sellers may only touch non-decision fields while in editable states.
create policy "Sellers update own editable applications"
on public.provider_verifications for update
using (
  public.owns_seller_profile(seller_id)
  and status in ('draft', 'additional_info_required', 'submitted')
)
with check (
  public.owns_seller_profile(seller_id)
  and status in ('draft', 'additional_info_required', 'submitted', 'under_review')
);

-- Officers may update applications (decisions go through RPC preferentially).
create policy "Officers update verification applications"
on public.provider_verifications for update
using (
  public.has_role('verification_officer')
  or public.has_role('super_admin')
  or public.is_admin()
)
with check (
  public.has_role('verification_officer')
  or public.has_role('super_admin')
  or public.is_admin()
);

-- Column grants: sellers must not write decision columns directly.
revoke update on public.provider_verifications from authenticated;
grant update (
  level, status, submitted_at, additional_info_request
) on public.provider_verifications to authenticated;
-- Decision columns (reviewed_at, reviewed_by, decision_notes, rejection_reason)
-- are written only by SECURITY DEFINER RPCs.

-- ---------------------------------------------------------------------------
-- 2. Officer decision RPC — approve / reject / request info
-- ---------------------------------------------------------------------------

create or replace function public.verification_officer_decide(
  p_verification_id uuid,
  p_decision        text,  -- 'approve' | 'reject' | 'request_info' | 'under_review'
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

  -- Officers must not decide their own seller application
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

    -- Authoritative profile flags (also audited inside set_seller_verification)
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

    -- Do not force is_verified false if they hold another approved level;
    -- only clear if this was the active path (simple V1: leave profile flag;
    -- officers can revoke via set_seller_verification explicitly).

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

  -- Audit (decision-specific; set_seller_verification also audits profile flag changes)
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

  -- Notify seller (notify_user is revoked from clients; this is SECURITY DEFINER)
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
-- 3. Seller resubmit after additional_info_required
-- ---------------------------------------------------------------------------

create or replace function public.verification_seller_resubmit(p_verification_id uuid)
returns public.provider_verifications
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  v public.provider_verifications;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into v
  from public.provider_verifications
  where id = p_verification_id
  for update;

  if not found then
    raise exception 'Verification application not found' using errcode = 'P0002';
  end if;

  if not public.owns_seller_profile(v.seller_id) then
    raise exception 'Not your application' using errcode = '42501';
  end if;

  if v.status <> 'additional_info_required' then
    raise exception 'Only applications needing more information can be resubmitted'
      using errcode = '23514';
  end if;

  update public.provider_verifications
  set
    status = 'submitted',
    submitted_at = now(),
    additional_info_request = null,
    updated_at = now()
  where id = v.id
  returning * into v;

  return v;
end;
$$;

grant execute on function public.verification_seller_resubmit(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Prevent sellers from writing approved/rejected status via direct UPDATE
-- ---------------------------------------------------------------------------

create or replace function public.protect_verification_status_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    -- Allow officers / service role
    if public.has_role('verification_officer')
       or public.has_role('super_admin')
       or auth.uid() is null then
      return new;
    end if;

    -- Sellers may move draft → submitted, additional_info → submitted only
    if public.owns_seller_profile(old.seller_id) then
      if old.status = 'draft' and new.status = 'submitted' then
        return new;
      end if;
      if old.status = 'additional_info_required' and new.status = 'submitted' then
        return new;
      end if;
      if old.status = 'submitted' and new.status = 'submitted' then
        return new;
      end if;
    end if;

    raise exception 'Permission denied: invalid verification status change'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_verification_status_columns_trigger on public.provider_verifications;
create trigger protect_verification_status_columns_trigger
  before update of status on public.provider_verifications
  for each row
  execute function public.protect_verification_status_columns();

-- ---------------------------------------------------------------------------
-- 5. Private storage bucket: verification-documents
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'storage' and table_name = 'buckets'
  ) then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'verification-documents',
      'verification-documents',
      false,
      10485760, -- 10 MiB
      array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    )
    on conflict (id) do update set
      public = false,
      file_size_limit = 10485760,
      allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  end if;
exception
  when others then
    raise notice 'verification-documents bucket bootstrap skipped: %', sqlerrm;
end;
$$;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'storage' and table_name = 'objects'
  ) then
    execute 'drop policy if exists "verification_docs_insert_own" on storage.objects';
    execute 'drop policy if exists "verification_docs_select_own" on storage.objects';

    execute $pol$
      create policy "verification_docs_insert_own"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'verification-documents'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
    $pol$;

    execute $pol$
      create policy "verification_docs_select_own"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'verification-documents'
        and (
          (storage.foldername(name))[1] = auth.uid()::text
          or public.has_role('verification_officer')
          or public.has_role('super_admin')
        )
      )
    $pol$;
  end if;
exception
  when others then
    raise notice 'verification storage policies skipped: %', sqlerrm;
end;
$$;

commit;
