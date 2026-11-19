-- =============================================================================
-- Module 10 — Admin Control Centre
-- user_roles, is_admin(), admin_audit_logs, admin policies, moderation RPCs
-- =============================================================================

-- ---------------------------------------------------------------------------
-- user_roles (manually provisioned admin only)
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  created_by uuid null references auth.users (id) on delete set null
);

alter table public.user_roles enable row level security;

-- ---------------------------------------------------------------------------
-- is_admin() helper — trusted, pinned search_path
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and ur.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- admin_audit_logs (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users (id),
  action text not null,
  target_type text not null check (target_type in ('shop', 'listing', 'verification_request')),
  target_id uuid not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_target_idx
  on public.admin_audit_logs (target_type, target_id);
create index if not exists admin_audit_logs_admin_idx
  on public.admin_audit_logs (admin_user_id);

alter table public.admin_audit_logs enable row level security;

-- Admins may read audit logs; no client insert/update/delete
drop policy if exists "admins_read_audit_logs" on public.admin_audit_logs;
create policy "admins_read_audit_logs"
  on public.admin_audit_logs for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- user_roles policies: users may read own role only; no self-promotion
-- ---------------------------------------------------------------------------
drop policy if exists "user_roles_read_own" on public.user_roles;
create policy "user_roles_read_own"
  on public.user_roles for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- No insert/update/delete policies for authenticated — provision via service role / SQL only

-- ---------------------------------------------------------------------------
-- Admin SELECT on key tables (narrow)
-- ---------------------------------------------------------------------------
drop policy if exists "admins_select_shops" on public.shops;
create policy "admins_select_shops"
  on public.shops for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "admins_select_listings" on public.listings;
create policy "admins_select_listings"
  on public.listings for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "admins_select_profiles" on public.profiles;
create policy "admins_select_profiles"
  on public.profiles for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "admins_select_subscriptions" on public.subscriptions;
create policy "admins_select_subscriptions"
  on public.subscriptions for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "admins_select_verification_requests" on public.verification_requests;
create policy "admins_select_verification_requests"
  on public.verification_requests for select
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Atomic moderation RPCs (service_role or security definer after is_admin check)
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_shop_suspension(
  p_shop_id uuid,
  p_suspended boolean,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_shop public.shops%rowtype;
begin
  if v_admin is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_reason is null or length(trim(p_reason)) < 3 or length(p_reason) > 500 then
    return jsonb_build_object('ok', false, 'error', 'invalid_reason');
  end if;

  select * into v_shop from public.shops where id = p_shop_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_shop.is_suspended = p_suspended then
    return jsonb_build_object('ok', true, 'unchanged', true);
  end if;

  update public.shops
  set
    is_suspended = p_suspended,
    suspended_at = case when p_suspended then now() else null end,
    suspension_reason = case when p_suspended then trim(p_reason) else null end,
    updated_at = now()
  where id = p_shop_id;

  insert into public.admin_audit_logs (admin_user_id, action, target_type, target_id, reason, metadata)
  values (
    v_admin,
    case when p_suspended then 'shop_suspended' else 'shop_restored' end,
    'shop',
    p_shop_id,
    trim(p_reason),
    jsonb_build_object(
      'previous_suspended', v_shop.is_suspended,
      'slug', v_shop.slug
    )
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.admin_set_shop_suspension(uuid, boolean, text) from public;
grant execute on function public.admin_set_shop_suspension(uuid, boolean, text) to authenticated;

create or replace function public.admin_set_listing_published(
  p_listing_id uuid,
  p_published boolean,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_listing public.listings%rowtype;
begin
  if v_admin is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_reason is null or length(trim(p_reason)) < 3 or length(p_reason) > 500 then
    return jsonb_build_object('ok', false, 'error', 'invalid_reason');
  end if;

  select * into v_listing from public.listings where id = p_listing_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_listing.is_published = p_published then
    return jsonb_build_object('ok', true, 'unchanged', true);
  end if;

  update public.listings
  set is_published = p_published, updated_at = now()
  where id = p_listing_id;

  insert into public.admin_audit_logs (admin_user_id, action, target_type, target_id, reason, metadata)
  values (
    v_admin,
    case when p_published then 'listing_published' else 'listing_unpublished' end,
    'listing',
    p_listing_id,
    trim(p_reason),
    jsonb_build_object(
      'previous_published', v_listing.is_published,
      'shop_id', v_listing.shop_id,
      'title', v_listing.title
    )
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.admin_set_listing_published(uuid, boolean, text) from public;
grant execute on function public.admin_set_listing_published(uuid, boolean, text) to authenticated;

comment on table public.user_roles is 'Manually provisioned roles. MVP: admin only. No public self-assign.';
comment on table public.admin_audit_logs is 'Append-only admin action audit. Inserts via trusted RPCs only.';
comment on function public.is_admin is 'True when auth.uid() has role=admin in user_roles.';


-- Allow admins to change suspension/verification fields via trusted RPCs.
-- Ordinary authenticated sellers remain blocked.
create or replace function public.protect_shop_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.role()) = 'authenticated' and not public.is_admin() then
    if new.verification_status is distinct from old.verification_status
       or new.verified_at is distinct from old.verified_at
       or new.is_suspended is distinct from old.is_suspended
       or new.suspended_at is distinct from old.suspended_at
       or new.suspension_reason is distinct from old.suspension_reason
       or new.verification_note is distinct from old.verification_note
    then
      raise exception 'Cannot modify verification or suspension fields from client';
    end if;
  end if;
  return new;
end;
$$;
