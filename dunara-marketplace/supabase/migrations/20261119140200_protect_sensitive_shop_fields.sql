-- =============================================================================
-- Protect shop fields sellers must not change directly:
-- verification_status, verified_at, is_suspended, suspended_at, suspension_reason
-- =============================================================================

create or replace function public.protect_shop_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Allow service role / elevated paths; block ordinary owner updates of admin fields
  if (select auth.role()) = 'authenticated' then
    if new.verification_status is distinct from old.verification_status
       or new.verified_at is distinct from old.verified_at
       or new.is_suspended is distinct from old.is_suspended
       or new.suspended_at is distinct from old.suspended_at
       or new.suspension_reason is distinct from old.suspension_reason
    then
      raise exception 'Cannot modify verification or suspension fields from client';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists shops_protect_admin_fields on public.shops;
create trigger shops_protect_admin_fields
  before update on public.shops
  for each row execute function public.protect_shop_admin_fields();

-- Simplify owner update policy (protection moved to trigger)
drop policy if exists "shops_owner_update" on public.shops;
create policy "shops_owner_update"
  on public.shops for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
