-- =============================================================================
-- Dunara MVP — Core schema (V3)
-- Additive, safe for empty or fresh projects. Does not drop existing data.
-- Apply via: supabase db push | supabase migration up | SQL editor
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger function
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles (extends auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup (idempotent)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  type text not null check (type in ('product', 'service', 'both')),
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint categories_slug_unique unique (slug)
);

create index if not exists categories_type_idx on public.categories (type);
create index if not exists categories_sort_order_idx on public.categories (sort_order);

-- ---------------------------------------------------------------------------
-- 3. shops (one per owner for MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slug text not null,
  bio text,
  category_id uuid references public.categories (id) on delete set null,
  shop_type text not null default 'both' check (shop_type in ('product', 'service', 'both')),
  logo_url text,
  phone text,                          -- WhatsApp number (public contact)
  email text,
  state text,
  city text,
  country text not null default 'Nigeria',
  instagram text,
  tiktok text,
  facebook text,
  twitter text,
  website text,
  is_published boolean not null default false,
  is_suspended boolean not null default false,
  suspended_at timestamptz,
  suspension_reason text,
  verification_status text not null default 'none'
    check (verification_status in ('none', 'pending', 'verified', 'rejected')),
  verified_at timestamptz,
  verification_note text,              -- seller-visible rejection / note
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shops_slug_unique unique (slug),
  constraint shops_one_per_owner unique (owner_id)
);

create index if not exists shops_owner_id_idx on public.shops (owner_id);
create index if not exists shops_category_id_idx on public.shops (category_id);
create index if not exists shops_published_idx on public.shops (is_published) where is_published = true and is_suspended = false;
create index if not exists shops_state_city_idx on public.shops (state, city);
create index if not exists shops_verification_status_idx on public.shops (verification_status);

drop trigger if exists shops_set_updated_at on public.shops;
create trigger shops_set_updated_at
  before update on public.shops
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. listings
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  price_kobo bigint,                   -- integer kobo; null when not supplied
  price_type text not null default 'fixed'
    check (price_type in ('fixed', 'from', 'negotiable')),
  listing_type text not null check (listing_type in ('product', 'service')),
  category_id uuid references public.categories (id) on delete set null,
  cover_image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listings_shop_slug_unique unique (shop_id, slug),
  constraint listings_price_kobo_non_negative check (price_kobo is null or price_kobo >= 0)
);

create index if not exists listings_shop_id_idx on public.listings (shop_id);
create index if not exists listings_category_id_idx on public.listings (category_id);
create index if not exists listings_published_idx on public.listings (is_published) where is_published = true;
create index if not exists listings_listing_type_idx on public.listings (listing_type);
create index if not exists listings_created_at_idx on public.listings (created_at desc);

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. listing_media
-- ---------------------------------------------------------------------------
create table if not exists public.listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,                   -- storage path or public URL
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists listing_media_listing_id_idx on public.listing_media (listing_id);

-- ---------------------------------------------------------------------------
-- 6. plans
-- ---------------------------------------------------------------------------
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  interval text not null check (interval in ('monthly', 'annual', 'none')),
  price_kobo bigint not null default 0 check (price_kobo >= 0),
  paystack_plan_code text,             -- null until configured in Paystack
  listing_limit int not null default 5, -- -1 = unlimited
  featured boolean not null default false,
  priority_boost boolean not null default false,
  ai_reply_limit_monthly int not null default 0, -- -1 = unlimited; TBD product values
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plans_slug_unique unique (slug)
);

create index if not exists plans_active_idx on public.plans (is_active) where is_active = true;

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
  before update on public.plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. subscriptions (one logical subscription per shop)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status text not null default 'free'
    check (status in ('trialing', 'active', 'past_due', 'cancelled', 'free')),
  billing_interval text check (billing_interval is null or billing_interval in ('monthly', 'annual')),
  paystack_subscription_code text,
  paystack_customer_code text,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_one_per_shop unique (shop_id)
);

create index if not exists subscriptions_shop_id_idx on public.subscriptions (shop_id);
create index if not exists subscriptions_plan_id_idx on public.subscriptions (plan_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. verification_requests (basic; Module 11 strengthens)
-- ---------------------------------------------------------------------------
create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  submitted_by uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  document_paths text[] not null default '{}',  -- private bucket object paths only
  priority boolean not null default false,      -- Apex snapshot at submission
  plan_slug_at_submission text,
  seller_note text,
  admin_note text,                              -- internal only
  rejection_reason text,                        -- seller-visible
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One pending request per shop
create unique index if not exists verification_one_pending_per_shop
  on public.verification_requests (shop_id)
  where status = 'pending';

create index if not exists verification_requests_shop_id_idx on public.verification_requests (shop_id);
create index if not exists verification_requests_status_idx on public.verification_requests (status);
create index if not exists verification_requests_queue_idx
  on public.verification_requests (priority desc, created_at asc)
  where status = 'pending';

drop trigger if exists verification_requests_set_updated_at on public.verification_requests;
create trigger verification_requests_set_updated_at
  before update on public.verification_requests
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. payment_events (Paystack webhook idempotency log)
-- ---------------------------------------------------------------------------
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  paystack_event_id text not null,
  payload jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  processing_error text,
  created_at timestamptz not null default now(),
  constraint payment_events_paystack_event_id_unique unique (paystack_event_id)
);

create index if not exists payment_events_processed_idx on public.payment_events (processed);
create index if not exists payment_events_event_type_idx on public.payment_events (event_type);

-- ---------------------------------------------------------------------------
-- 10. AI assistant tables (Module 9)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_assistant_settings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  language text not null default 'english'
    check (language in ('english', 'pidgin')),
  personality text not null default 'professional'
    check (personality in ('professional', 'friendly', 'warm', 'persuasive', 'custom')),
  custom_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_assistant_settings_shop_unique unique (shop_id)
);

drop trigger if exists ai_assistant_settings_set_updated_at on public.ai_assistant_settings;
create trigger ai_assistant_settings_set_updated_at
  before update on public.ai_assistant_settings
  for each row execute function public.set_updated_at();

create table if not exists public.ai_usage_monthly (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  period_start date not null,
  reply_count int not null default 0 check (reply_count >= 0),
  guide_count int not null default 0 check (guide_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_usage_monthly_shop_period_unique unique (shop_id, period_start)
);

create index if not exists ai_usage_monthly_shop_id_idx on public.ai_usage_monthly (shop_id);

drop trigger if exists ai_usage_monthly_set_updated_at on public.ai_usage_monthly;
create trigger ai_usage_monthly_set_updated_at
  before update on public.ai_usage_monthly
  for each row execute function public.set_updated_at();

create table if not exists public.ai_reply_events (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  usage_period_start date not null,
  action text not null check (action in ('reply_draft', 'guide')),
  language text,
  personality text,
  status text not null check (status in ('success', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists ai_reply_events_shop_id_idx on public.ai_reply_events (shop_id);
create index if not exists ai_reply_events_seller_id_idx on public.ai_reply_events (seller_id);
create index if not exists ai_reply_events_period_idx on public.ai_reply_events (usage_period_start);

-- ---------------------------------------------------------------------------
-- Comments for operators
-- ---------------------------------------------------------------------------
comment on table public.profiles is 'User profile; id = auth.users.id';
comment on table public.shops is 'One shop per seller (MVP). Public when is_published and not is_suspended.';
comment on table public.listings is 'Product or service listings. price_kobo is integer kobo.';
comment on table public.plans is 'Open / Pulse / Apex plan definitions. Paystack codes filled later.';
comment on table public.subscriptions is 'One subscription row per shop. Source of truth for entitlements.';
comment on table public.verification_requests is 'Manual verification applications. document_paths are private storage paths.';
comment on table public.payment_events is 'Idempotent Paystack webhook event log. No secrets stored.';
comment on column public.shops.phone is 'WhatsApp number shown publicly for Chat on WhatsApp CTA';
comment on column public.listings.price_kobo is 'Price in kobo (integer). Null when price not supplied.';
comment on column public.plans.listing_limit is '-1 means unlimited published listings';
comment on column public.plans.ai_reply_limit_monthly is '-1 means unlimited; product values TBD';
