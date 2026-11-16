-- Dúnarà Marketplace — Prompt 12: Admin dashboard RPCs and policies
-- Privileged actions via SECURITY DEFINER; audited; no universal admin role.

begin;

-- ---------------------------------------------------------------------------
-- 1. Admins may SELECT inactive profiles (for suspension management)
-- ---------------------------------------------------------------------------
drop policy if exists "Users can view any active profile" on public.profiles;
create policy "Profiles readable by self, active public, or admin"
  on public.profiles for select
  using (
    id = auth.uid()
    or is_active = true
    or public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- 2. Suspend / reinstate account (operations_manager | super_admin)
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

  -- Prevent suspending the last super_admin (best-effort)
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

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    case when p_is_active then 'user.reinstate' else 'user.suspend' end,
    'profile',
    p_user_id,
    jsonb_build_object('reason', nullif(trim(coalesce(p_reason, '')), ''), 'is_active', p_is_active)
  );

  return target;
end;
$$;

revoke all on function public.admin_set_user_active(uuid, boolean, text) from public, anon;
grant execute on function public.admin_set_user_active(uuid, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Listing moderation (moderator | operations_manager | super_admin)
-- ---------------------------------------------------------------------------
create or replace function public.admin_moderate_listing(
  p_listing_id uuid,
  p_status public.listing_status,
  p_notes text default null
)
returns public.service_listings
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  listing public.service_listings;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not (
    public.has_role('moderator')
    or public.has_role('operations_manager')
    or public.has_role('super_admin')
  ) then
    raise exception 'Permission denied: moderator role required' using errcode = '42501';
  end if;

  if p_status not in ('published', 'archived', 'suspended', 'draft') then
    raise exception 'Invalid listing status for moderation' using errcode = '23514';
  end if;

  update public.service_listings
  set status = p_status, updated_at = now()
  where id = p_listing_id
  returning * into listing;

  if not found then
    raise exception 'Listing not found' using errcode = 'P0002';
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    'listing.moderate',
    'service_listing',
    p_listing_id,
    jsonb_build_object(
      'status', p_status,
      'notes', nullif(trim(coalesce(p_notes, '')), ''),
      'seller_id', listing.seller_id
    )
  );

  return listing;
end;
$$;

revoke all on function public.admin_moderate_listing(uuid, public.listing_status, text)
  from public, anon;
grant execute on function public.admin_moderate_listing(uuid, public.listing_status, text)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Category management (operations_manager | super_admin)
-- ---------------------------------------------------------------------------
create or replace function public.admin_upsert_category(
  p_id uuid default null,
  p_name text default null,
  p_slug text default null,
  p_description text default null,
  p_is_active boolean default true,
  p_sort_order integer default 0
)
returns public.categories
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  result public.categories;
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not (
    public.has_role('operations_manager')
    or public.has_role('super_admin')
  ) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  if p_id is null then
    if p_name is null or p_slug is null then
      raise exception 'name and slug required for create' using errcode = '23514';
    end if;
    insert into public.categories (name, slug, description, is_active, sort_order)
    values (
      trim(p_name),
      lower(trim(p_slug)),
      nullif(trim(coalesce(p_description, '')), ''),
      coalesce(p_is_active, true),
      coalesce(p_sort_order, 0)
    )
    returning * into result;
  else
    update public.categories
    set
      name = coalesce(nullif(trim(coalesce(p_name, '')), ''), name),
      slug = coalesce(nullif(lower(trim(coalesce(p_slug, ''))), ''), slug),
      description = case
        when p_description is null then description
        else nullif(trim(p_description), '')
      end,
      is_active = coalesce(p_is_active, is_active),
      sort_order = coalesce(p_sort_order, sort_order),
      updated_at = now()
    where id = p_id
    returning * into result;

    if not found then
      raise exception 'Category not found' using errcode = 'P0002';
    end if;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  values (
    actor,
    case when p_id is null then 'category.create' else 'category.update' end,
    'category',
    result.id,
    jsonb_build_object('name', result.name, 'slug', result.slug, 'is_active', result.is_active)
  );

  return result;
end;
$$;

revoke all on function public.admin_upsert_category(uuid, text, text, text, boolean, integer)
  from public, anon;
grant execute on function public.admin_upsert_category(uuid, text, text, text, boolean, integer)
  to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Platform settings key-value (super_admin only) — simple table
-- ---------------------------------------------------------------------------
create table if not exists public.platform_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

drop policy if exists "Admins read platform settings" on public.platform_settings;
create policy "Admins read platform settings"
  on public.platform_settings for select
  using (public.is_admin());

-- Writes only via RPC
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
begin
  if actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not public.has_role('super_admin') then
    raise exception 'Permission denied: super_admin required' using errcode = '42501';
  end if;

  if p_key is null or length(trim(p_key)) < 1 then
    raise exception 'Setting key required' using errcode = '23514';
  end if;

  insert into public.platform_settings (key, value, updated_by, updated_at)
  values (trim(p_key), coalesce(p_value, '{}'::jsonb), actor, now())
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

revoke all on function public.admin_set_platform_setting(text, jsonb) from public, anon;
grant execute on function public.admin_set_platform_setting(text, jsonb) to authenticated;

commit;
