-- Dúnarà Marketplace — Admin security hardening (post Prompt 12 review)
-- 1) Report triage RPC (audited, role-scoped)
-- 2) Tighten reports UPDATE + categories RLS to section roles
-- 3) Suspension also deactivates seller + suspends published listings
-- 4) Platform setting key format validation

begin;

-- ---------------------------------------------------------------------------
-- 1. admin_triage_report — SECURITY DEFINER, audited, section roles only
-- ---------------------------------------------------------------------------
create or replace function public.admin_triage_report(
  p_report_id uuid,
  p_status public.report_status,
  p_notes text default null
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  result public.reports;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not (
    public.has_role('support')
    or public.has_role('moderator')
    or public.has_role('operations_manager')
    or public.has_role('super_admin')
  ) then
    raise exception 'Permission denied: report triage role required'
      using errcode = '42501';
  end if;

  if p_status not in ('under_review', 'resolved', 'dismissed') then
    raise exception 'Invalid triage status' using errcode = '23514';
  end if;

  update public.reports
  set
    status = p_status,
    handled_by = actor,
    handled_at = now(),
    resolution_notes = nullif(trim(coalesce(p_notes, '')), ''),
    updated_at = now()
  where id = p_report_id
  returning * into result;

  if not found then
    raise exception 'Report not found' using errcode = 'P0002';
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    'report.triage',
    'report',
    p_report_id,
    jsonb_build_object(
      'status', p_status,
      'notes', nullif(trim(coalesce(p_notes, '')), '')
    )
  );

  return result;
end;
$$;

revoke all on function public.admin_triage_report(uuid, public.report_status, text)
  from public, anon;
grant execute on function public.admin_triage_report(uuid, public.report_status, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Tighten reports UPDATE — only triage roles (not all is_admin)
-- ---------------------------------------------------------------------------
drop policy if exists "Admins can update reports" on public.reports;

create policy "Report triage roles can update reports"
  on public.reports for update
  using (
    public.has_role('support')
    or public.has_role('moderator')
    or public.has_role('operations_manager')
    or public.has_role('super_admin')
  )
  with check (
    public.has_role('support')
    or public.has_role('moderator')
    or public.has_role('operations_manager')
    or public.has_role('super_admin')
  );

-- Prefer RPC path; table UPDATE remains as defence-in-depth for triage roles only.

-- ---------------------------------------------------------------------------
-- 3. Categories RLS — operations_manager | super_admin only
-- ---------------------------------------------------------------------------
drop policy if exists "Admins insert categories" on public.categories;
drop policy if exists "Admins update categories" on public.categories;
drop policy if exists "Admins delete categories" on public.categories;

create policy "Ops insert categories"
  on public.categories for insert
  with check (
    public.has_role('operations_manager') or public.has_role('super_admin')
  );

create policy "Ops update categories"
  on public.categories for update
  using (
    public.has_role('operations_manager') or public.has_role('super_admin')
  )
  with check (
    public.has_role('operations_manager') or public.has_role('super_admin')
  );

create policy "Ops delete categories"
  on public.categories for delete
  using (
    public.has_role('operations_manager') or public.has_role('super_admin')
  );

-- ---------------------------------------------------------------------------
-- 4. Enhance suspension: deactivate seller + suspend published listings
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_user_active(
  p_user_id uuid,
  p_is_active boolean,
  p_reason text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  target public.profiles;
  seller_id uuid;
  listings_affected integer := 0;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not (
    public.has_role('operations_manager')
    or public.has_role('super_admin')
  ) then
    raise exception 'Permission denied: operations_manager or super_admin required'
      using errcode = '42501';
  end if;

  if p_user_id = actor then
    raise exception 'Cannot change your own active status' using errcode = '42501';
  end if;

  if p_is_active = false and exists (
    select 1 from public.user_roles
    where user_id = p_user_id and role = 'super_admin'
      and is_active = true and revoked_at is null
  ) then
    if (
      select count(*) from public.user_roles
      where role = 'super_admin' and is_active = true and revoked_at is null
    ) <= 1 then
      raise exception 'Cannot suspend the only active super_admin'
        using errcode = '42501';
    end if;
  end if;

  update public.profiles
  set is_active = p_is_active, updated_at = now()
  where id = p_user_id
  returning * into target;

  if not found then
    raise exception 'User not found' using errcode = 'P0002';
  end if;

  select id into seller_id
  from public.seller_profiles
  where user_id = p_user_id
  limit 1;

  if seller_id is not null then
    if p_is_active = false then
      update public.seller_profiles
      set is_active = false, is_accepting_work = false, updated_at = now()
      where id = seller_id;

      update public.service_listings
      set status = 'suspended', updated_at = now()
      where seller_id = seller_id
        and status = 'published';
      get diagnostics listings_affected = row_count;
    else
      -- Reinstate seller profile active flag; do not auto-republish listings
      update public.seller_profiles
      set is_active = true, updated_at = now()
      where id = seller_id;
    end if;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    case when p_is_active then 'user.reinstate' else 'user.suspend' end,
    'profile',
    p_user_id,
    jsonb_build_object(
      'reason', nullif(trim(coalesce(p_reason, '')), ''),
      'is_active', p_is_active,
      'seller_id', seller_id,
      'listings_suspended', listings_affected
    )
  );

  return target;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Platform setting key validation
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_platform_setting(
  p_key text,
  p_value jsonb
)
returns public.platform_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  result public.platform_settings;
  clean_key text;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not public.has_role('super_admin') then
    raise exception 'Permission denied: super_admin required' using errcode = '42501';
  end if;

  clean_key := lower(trim(coalesce(p_key, '')));
  if clean_key !~ '^[a-z][a-z0-9_]{1,63}$' then
    raise exception 'Invalid setting key format'
      using errcode = '23514';
  end if;

  insert into public.platform_settings (key, value, updated_by, updated_at)
  values (clean_key, coalesce(p_value, '{}'::jsonb), actor, now())
  on conflict (key) do update
    set value = excluded.value,
        updated_by = actor,
        updated_at = now()
  returning * into result;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    'platform_setting.set',
    'platform_settings',
    null,
    jsonb_build_object('key', result.key, 'value', result.value)
  );

  return result;
end;
$$;

commit;
