-- =============================================================================
-- Dunara seed — Nigerian-focused categories + Open/Pulse/Apex plans
-- Idempotent: safe to re-run (ON CONFLICT DO UPDATE / DO NOTHING)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Categories (products + services)
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug, type, icon, sort_order) values
  ('Fashion & Clothing', 'fashion-clothing', 'product', 'shirt', 10),
  ('Beauty & Personal Care', 'beauty-personal-care', 'both', 'sparkles', 20),
  ('Food & Groceries', 'food-groceries', 'product', 'utensils', 30),
  ('Electronics & Gadgets', 'electronics-gadgets', 'product', 'smartphone', 40),
  ('Home & Living', 'home-living', 'product', 'home', 50),
  ('Health & Wellness', 'health-wellness', 'both', 'heart-pulse', 60),
  ('Education & Tutoring', 'education-tutoring', 'service', 'book-open', 70),
  ('Professional Services', 'professional-services', 'service', 'briefcase', 80),
  ('Events & Entertainment', 'events-entertainment', 'service', 'party-popper', 90),
  ('Auto & Transport', 'auto-transport', 'both', 'car', 100),
  ('Agriculture & Farming', 'agriculture-farming', 'both', 'sprout', 110),
  ('Construction & Trades', 'construction-trades', 'service', 'hammer', 120),
  ('Digital Services', 'digital-services', 'service', 'monitor', 130),
  ('Handmade & Crafts', 'handmade-crafts', 'product', 'palette', 140),
  ('Hotels & Short Stays', 'hotels-short-stays', 'service', 'bed-double', 150),
  ('Apartments', 'apartments', 'service', 'building', 160),
  ('House Rentals', 'house-rentals', 'service', 'home', 170),
  ('Other', 'other', 'both', 'more-horizontal', 999)
on conflict (slug) do update set
  name = excluded.name,
  type = excluded.type,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Plans (V3 pricing)
-- price_kobo: Naira * 100
-- Open: free, 5 listings
-- Pulse: ₦4,000/mo or ₦38,400/yr, 30 listings, featured
-- Apex: ₦30,000/mo or ₦288,000/yr, unlimited, featured + priority
-- ai_reply_limit_monthly left as placeholder (0 / TBD); update via admin later
-- paystack_plan_code remains null until configured in Paystack dashboard
-- ---------------------------------------------------------------------------
insert into public.plans (
  name, slug, interval, price_kobo, paystack_plan_code,
  listing_limit, featured, priority_boost, ai_reply_limit_monthly,
  sort_order, is_active
) values
  ('Open',  'open',          'none',    0,       null,  5,  false, false, 10,  10, true),
  ('Pulse', 'pulse_monthly', 'monthly', 400000,  null, 30,  true,  false, 50,  20, true),
  ('Pulse', 'pulse_annual',  'annual',  3840000, null, 30,  true,  false, 50,  21, true),
  ('Apex',  'apex_monthly',  'monthly', 3000000, null, -1,  true,  true,  200, 30, true),
  ('Apex',  'apex_annual',   'annual',  28800000,null, -1,  true,  true,  200, 31, true)
on conflict (slug) do update set
  name = excluded.name,
  interval = excluded.interval,
  price_kobo = excluded.price_kobo,
  listing_limit = excluded.listing_limit,
  featured = excluded.featured,
  priority_boost = excluded.priority_boost,
  ai_reply_limit_monthly = excluded.ai_reply_limit_monthly,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = now();

-- Note: AI reply quotas above are starting placeholders.
-- Product owner must approve final monthly limits before launch.
