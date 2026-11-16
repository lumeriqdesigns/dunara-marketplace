-- =============================================================================
-- Dúnarà Marketplace — Development Seed Data
-- Safe, non-production data only. Do not use in production.
-- =============================================================================

-- Categories (Nigerian service marketplace focus)
INSERT INTO public.categories (id, name, slug, description, icon, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Home Services', 'home-services', 'Repairs, cleaning, maintenance and household help', 'House', 10),
  ('a1000000-0000-4000-8000-000000000002', 'Beauty & Wellness', 'beauty-wellness', 'Hair, makeup, spa, fitness and personal care', 'Scissors', 20),
  ('a1000000-0000-4000-8000-000000000003', 'Events & Entertainment', 'events-entertainment', 'Photography, catering, DJs, decor and event planning', 'Camera', 30),
  ('a1000000-0000-4000-8000-000000000004', 'Professional Services', 'professional-services', 'Legal, accounting, consulting and business support', 'BriefcaseBusiness', 40),
  ('a1000000-0000-4000-8000-000000000005', 'Tech & Digital', 'tech-digital', 'Web development, design, IT support and digital marketing', 'Code2', 50),
  ('a1000000-0000-4000-8000-000000000006', 'Trades & Construction', 'trades-construction', 'Plumbing, electrical, carpentry, painting and building', 'Hammer', 60),
  ('a1000000-0000-4000-8000-000000000007', 'Automotive', 'automotive', 'Car repair, detailing, towing and vehicle services', 'Wrench', 70),
  ('a1000000-0000-4000-8000-000000000008', 'Education & Tutoring', 'education-tutoring', 'Home tutoring, skill training and academic support', 'Sparkles', 80)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories example
INSERT INTO public.categories (id, name, slug, description, parent_id, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000011', 'Cleaning', 'cleaning', 'Residential and commercial cleaning', 'a1000000-0000-4000-8000-000000000001', 11),
  ('a1000000-0000-4000-8000-000000000012', 'Plumbing', 'plumbing', 'Pipe repairs, installations and emergency plumbing', 'a1000000-0000-4000-8000-000000000006', 61),
  ('a1000000-0000-4000-8000-000000000013', 'Photography', 'photography', 'Event, portrait and commercial photography', 'a1000000-0000-4000-8000-000000000003', 31)
ON CONFLICT (slug) DO NOTHING;

-- Note: User profiles, seller profiles, listings, bookings etc. should be created
-- through the application or via authenticated test helpers after auth users exist.
-- Do not insert fake auth.users records here.

-- Location reference rows are primarily maintained in src/data/locations.ts for MVP UI.
-- Optionally bulk-load into public.locations via a one-off script after migrations.
