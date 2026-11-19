-- =============================================================================
-- Dunara — Schema & RLS smoke checks
-- Run in Supabase SQL editor AFTER migrations + seed.
-- These are read-only assertions; they do not mutate production data.
-- For full RLS identity tests, use the Supabase dashboard "Impersonate" or
-- automated tests with service-role + set_config('request.jwt.claim.sub', ...).
-- =============================================================================

-- 1. Required tables exist
do $$
declare
  missing text;
begin
  select string_agg(t, ', ') into missing
  from unnest(array[
    'profiles','shops','categories','listings','listing_media',
    'plans','subscriptions','verification_requests','payment_events',
    'ai_assistant_settings','ai_usage_monthly','ai_reply_events'
  ]) as t
  where not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = t
  );
  if missing is not null then
    raise exception 'Missing tables: %', missing;
  end if;
  raise notice 'OK: all core tables present';
end $$;

-- 2. RLS enabled
do $$
declare
  missing text;
begin
  select string_agg(c.relname, ', ') into missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'profiles','shops','categories','listings','listing_media',
      'plans','subscriptions','verification_requests','payment_events',
      'ai_assistant_settings','ai_usage_monthly','ai_reply_events'
    )
    and c.relkind = 'r'
    and c.relrowsecurity = false;
  if missing is not null then
    raise exception 'RLS not enabled on: %', missing;
  end if;
  raise notice 'OK: RLS enabled on all application tables';
end $$;

-- 3. Unique constraints exist
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'shops_slug_unique' or conname = 'shops_one_per_owner'
  ) then
    raise exception 'Missing shops unique constraints';
  end if;
  if not exists (
    select 1 from pg_indexes
    where indexname = 'verification_one_pending_per_shop'
  ) then
    raise exception 'Missing partial unique index verification_one_pending_per_shop';
  end if;
  raise notice 'OK: key unique constraints present';
end $$;

-- 4. Seed plans present
do $$
declare
  cnt int;
begin
  select count(*) into cnt from public.plans where slug in ('open','pulse_monthly','pulse_annual','apex_monthly','apex_annual');
  if cnt < 5 then
    raise exception 'Expected 5 plan rows, found %', cnt;
  end if;
  raise notice 'OK: plan seed rows present (%)', cnt;
end $$;

-- 5. Seed categories present
do $$
declare
  cnt int;
begin
  select count(*) into cnt from public.categories;
  if cnt < 10 then
    raise exception 'Expected >= 10 categories, found %', cnt;
  end if;
  raise notice 'OK: category seed rows present (%)', cnt;
end $$;

-- 6. Money columns are integer/bigint (not float)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and column_name in ('price_kobo')
      and data_type not in ('bigint', 'integer')
  ) then
    raise exception 'price_kobo must be integer/bigint';
  end if;
  raise notice 'OK: money columns use integer types';
end $$;

raise notice 'All schema smoke checks passed.';
