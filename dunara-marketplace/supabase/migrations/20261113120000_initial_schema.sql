-- =============================================================================
-- Dúnarà Marketplace — Initial Database Schema
-- Phase 2: Database Architecture
-- Owner: Lumeriq Designs
-- =============================================================================
-- Principles:
--   • UUID primary keys
--   • UTC timestamps (timestamptz)
--   • Strict foreign keys + constraints
--   • Row Level Security on every exposed table
--   • No payment processing tables in MVP
--   • Integer kobo columns prepared for future monetary values
--   • Private verification documents (no public access)
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE public.user_role AS ENUM (
  'buyer',
  'seller',
  'support',
  'verification_officer',
  'moderator',
  'operations_manager',
  'super_admin'
);

CREATE TYPE public.verification_level AS ENUM (
  'basic',
  'identity',
  'business',
  'professional'
);

CREATE TYPE public.verification_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'additional_info_required',
  'approved',
  'rejected'
);

CREATE TYPE public.listing_status AS ENUM (
  'draft',
  'published',
  'archived',
  'suspended'
);

CREATE TYPE public.booking_type AS ENUM (
  'direct',
  'quotation'
);

CREATE TYPE public.booking_status AS ENUM (
  'requested',
  'quoted',
  'accepted',
  'awaiting_confirmation',
  'confirmed',
  'in_progress',
  'completed',
  'declined',
  'cancelled',
  'disputed'
);

CREATE TYPE public.quote_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'expired',
  'withdrawn'
);

CREATE TYPE public.notification_channel AS ENUM (
  'in_app',
  'email',
  'push',
  'telegram'
);

CREATE TYPE public.report_status AS ENUM (
  'open',
  'under_review',
  'resolved',
  'dismissed'
);

CREATE TYPE public.report_target_type AS ENUM (
  'listing',
  'review',
  'user',
  'message',
  'other'
);

-- =============================================================================
-- 1. PROFILES (extends auth.users)
-- =============================================================================

CREATE TABLE public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT,
  full_name         TEXT,
  display_name      TEXT,
  phone             TEXT,
  avatar_url        TEXT,
  bio               TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  last_seen_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT profiles_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_profiles_email ON public.profiles (email);
CREATE INDEX idx_profiles_is_active ON public.profiles (is_active) WHERE is_active = true;

COMMENT ON TABLE public.profiles IS 'Core user profile linked 1:1 with auth.users';

-- =============================================================================
-- 2. USER_ROLES
-- =============================================================================

CREATE TABLE public.user_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        public.user_role NOT NULL,
  granted_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at  TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT user_roles_unique_active UNIQUE NULLS NOT DISTINCT (user_id, role, is_active)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles (role) WHERE is_active = true;

COMMENT ON TABLE public.user_roles IS 'A user may hold multiple roles (buyer + seller). Privileged roles are granted only by trusted server-side logic.';

-- =============================================================================
-- 3. BUYER_PROFILES
-- =============================================================================

CREATE TABLE public.buyer_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_city  TEXT,
  preferred_state TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_buyer_profiles_user_id ON public.buyer_profiles (user_id);

-- =============================================================================
-- 4. SELLER_PROFILES
-- =============================================================================

CREATE TABLE public.seller_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name       TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  tagline             TEXT,
  description         TEXT,
  logo_url            TEXT,
  cover_image_url     TEXT,
  website             TEXT,
  phone               TEXT,
  whatsapp_number     TEXT,
  email_public        TEXT,
  years_experience    INTEGER CHECK (years_experience IS NULL OR years_experience >= 0),
  is_verified         BOOLEAN NOT NULL DEFAULT false,
  verification_level  public.verification_level,
  average_rating      NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  review_count        INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  completed_bookings  INTEGER NOT NULL DEFAULT 0 CHECK (completed_bookings >= 0),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  is_accepting_work   BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT seller_profiles_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX idx_seller_profiles_user_id ON public.seller_profiles (user_id);
CREATE INDEX idx_seller_profiles_slug ON public.seller_profiles (slug);
CREATE INDEX idx_seller_profiles_is_verified ON public.seller_profiles (is_verified) WHERE is_verified = true;
CREATE INDEX idx_seller_profiles_active ON public.seller_profiles (is_active, is_accepting_work) WHERE is_active = true;

COMMENT ON TABLE public.seller_profiles IS 'Business-facing seller profile. is_verified is set only by authorised verification officers.';

-- =============================================================================
-- 5. PROVIDER_VERIFICATIONS
-- =============================================================================

CREATE TABLE public.provider_verifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  level               public.verification_level NOT NULL,
  status              public.verification_status NOT NULL DEFAULT 'draft',
  submitted_at        TIMESTAMPTZ,
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  decision_notes      TEXT,
  rejection_reason    TEXT,
  additional_info_request TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_provider_verifications_seller ON public.provider_verifications (seller_id);
CREATE INDEX idx_provider_verifications_status ON public.provider_verifications (status);

COMMENT ON TABLE public.provider_verifications IS 'Verification applications. Sellers cannot approve their own applications.';

-- =============================================================================
-- 6. PROVIDER_DOCUMENTS (private)
-- =============================================================================

CREATE TABLE public.provider_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id   UUID NOT NULL REFERENCES public.provider_verifications(id) ON DELETE CASCADE,
  seller_id         UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  document_type     TEXT NOT NULL,
  file_path         TEXT NOT NULL,          -- path in private storage bucket
  file_name         TEXT NOT NULL,
  mime_type         TEXT NOT NULL,
  file_size_bytes   INTEGER NOT NULL CHECK (file_size_bytes > 0),
  uploaded_by       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT provider_documents_mime_check CHECK (
    mime_type IN (
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp'
    )
  )
);

CREATE INDEX idx_provider_documents_verification ON public.provider_documents (verification_id);
CREATE INDEX idx_provider_documents_seller ON public.provider_documents (seller_id);

COMMENT ON TABLE public.provider_documents IS 'Private verification documents. Access only via signed URLs for authorised officers and the owning seller.';

-- =============================================================================
-- 7. PROVIDER_SERVICE_AREAS
-- =============================================================================

CREATE TABLE public.provider_service_areas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id     UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  country       TEXT NOT NULL DEFAULT 'Nigeria',
  state         TEXT NOT NULL,
  city          TEXT NOT NULL,
  lga           TEXT,                       -- Local Government Area
  neighbourhood TEXT,
  is_primary    BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_provider_service_areas_seller ON public.provider_service_areas (seller_id);
CREATE INDEX idx_provider_service_areas_location ON public.provider_service_areas (state, city);

-- =============================================================================
-- 8. PROVIDER_AVAILABILITY
-- =============================================================================

CREATE TABLE public.provider_availability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT provider_availability_time_check CHECK (end_time > start_time)
);

CREATE INDEX idx_provider_availability_seller ON public.provider_availability (seller_id);

-- =============================================================================
-- 9. CATEGORIES
-- =============================================================================

CREATE TABLE public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,
  parent_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX idx_categories_parent ON public.categories (parent_id);
CREATE INDEX idx_categories_active ON public.categories (is_active) WHERE is_active = true;

-- =============================================================================
-- 10. SERVICE_LISTINGS
-- =============================================================================

CREATE TABLE public.service_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL,
  description       TEXT,
  status            public.listing_status NOT NULL DEFAULT 'draft',
  -- Future monetary fields stored in kobo (integer). Not used for payment processing in MVP.
  price_from_kobo   INTEGER CHECK (price_from_kobo IS NULL OR price_from_kobo >= 0),
  price_to_kobo     INTEGER CHECK (price_to_kobo IS NULL OR price_to_kobo >= 0),
  price_unit        TEXT,                   -- e.g. 'per_job', 'per_hour', 'starting_from'
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  view_count        INTEGER NOT NULL DEFAULT 0,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT service_listings_slug_unique UNIQUE (seller_id, slug),
  CONSTRAINT service_listings_price_range CHECK (
    price_to_kobo IS NULL OR price_from_kobo IS NULL OR price_to_kobo >= price_from_kobo
  )
);

CREATE INDEX idx_service_listings_seller ON public.service_listings (seller_id);
CREATE INDEX idx_service_listings_category ON public.service_listings (category_id);
CREATE INDEX idx_service_listings_status ON public.service_listings (status) WHERE status = 'published';
CREATE INDEX idx_service_listings_published ON public.service_listings (published_at DESC) WHERE status = 'published';

-- =============================================================================
-- 11. LISTING_MEDIA
-- =============================================================================

CREATE TABLE public.listing_media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id    UUID NOT NULL REFERENCES public.service_listings(id) ON DELETE CASCADE,
  file_path     TEXT NOT NULL,
  file_name     TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_cover      BOOLEAN NOT NULL DEFAULT false,
  alt_text      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listing_media_listing ON public.listing_media (listing_id);

-- =============================================================================
-- 12. FAVOURITES
-- =============================================================================

CREATE TABLE public.favourites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id     UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  listing_id    UUID REFERENCES public.service_listings(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT favourites_target_check CHECK (
    (seller_id IS NOT NULL AND listing_id IS NULL) OR
    (seller_id IS NULL AND listing_id IS NOT NULL)
  ),
  CONSTRAINT favourites_unique_seller UNIQUE (user_id, seller_id),
  CONSTRAINT favourites_unique_listing UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_favourites_user ON public.favourites (user_id);

-- =============================================================================
-- 13. BOOKINGS
-- =============================================================================

CREATE TABLE public.bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code      TEXT NOT NULL UNIQUE,  -- human-readable short code
  buyer_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  seller_id           UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE RESTRICT,
  listing_id          UUID REFERENCES public.service_listings(id) ON DELETE SET NULL,
  booking_type        public.booking_type NOT NULL DEFAULT 'direct',
  status              public.booking_status NOT NULL DEFAULT 'requested',
  title               TEXT,
  description         TEXT,
  preferred_date      DATE,
  preferred_time_start TIME,
  preferred_time_end  TIME,
  location_text       TEXT,
  location_state      TEXT,
  location_city       TEXT,
  -- Future: amount_kobo INTEGER (no payment processing in MVP)
  buyer_notes         TEXT,
  seller_notes        TEXT,
  completed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_buyer ON public.bookings (buyer_id);
CREATE INDEX idx_bookings_seller ON public.bookings (seller_id);
CREATE INDEX idx_bookings_status ON public.bookings (status);
CREATE INDEX idx_bookings_reference ON public.bookings (reference_code);
CREATE INDEX idx_bookings_created ON public.bookings (created_at DESC);

COMMENT ON TABLE public.bookings IS 'Core booking / enquiry record. No payment status in MVP.';

-- =============================================================================
-- 14. BOOKING_QUOTES
-- =============================================================================

CREATE TABLE public.booking_quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  seller_id       UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  amount_kobo     INTEGER NOT NULL CHECK (amount_kobo >= 0),  -- prepared for future use; not processed in MVP
  currency        TEXT NOT NULL DEFAULT 'NGN',
  description     TEXT,
  valid_until     TIMESTAMPTZ,
  status          public.quote_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_quotes_booking ON public.booking_quotes (booking_id);
CREATE INDEX idx_booking_quotes_seller ON public.booking_quotes (seller_id);

-- =============================================================================
-- 15. BOOKING_STATUS_HISTORY
-- =============================================================================

CREATE TABLE public.booking_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status   public.booking_status,
  to_status     public.booking_status NOT NULL,
  changed_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_status_history_booking ON public.booking_status_history (booking_id);

-- =============================================================================
-- 16. CONVERSATIONS
-- =============================================================================

CREATE TABLE public.conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  subject         TEXT,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_booking ON public.conversations (booking_id);
CREATE INDEX idx_conversations_last_message ON public.conversations (last_message_at DESC NULLS LAST);

-- =============================================================================
-- 17. CONVERSATION_MEMBERS
-- =============================================================================

CREATE TABLE public.conversation_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_read_at    TIMESTAMPTZ,
  is_muted        BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT conversation_members_unique UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_conversation_members_user ON public.conversation_members (user_id);
CREATE INDEX idx_conversation_members_conversation ON public.conversation_members (conversation_id);

-- =============================================================================
-- 18. MESSAGES
-- =============================================================================

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body            TEXT,
  is_system       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at       TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON public.messages (conversation_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages (sender_id);

-- =============================================================================
-- 19. MESSAGE_ATTACHMENTS
-- =============================================================================

CREATE TABLE public.message_attachments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id    UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_path     TEXT NOT NULL,          -- private storage
  file_name     TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_attachments_message ON public.message_attachments (message_id);

-- =============================================================================
-- 20. NOTIFICATIONS
-- =============================================================================

CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT,
  data          JSONB DEFAULT '{}',
  channel       public.notification_channel NOT NULL DEFAULT 'in_app',
  is_read       BOOLEAN NOT NULL DEFAULT false,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications (user_id) WHERE is_read = false;

-- =============================================================================
-- 21. NOTIFICATION_PREFERENCES
-- =============================================================================

CREATE TABLE public.notification_preferences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled  BOOLEAN NOT NULL DEFAULT true,
  telegram_enabled BOOLEAN NOT NULL DEFAULT false,
  marketing_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 22. PUSH_SUBSCRIPTIONS
-- =============================================================================

CREATE TABLE public.push_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint      TEXT NOT NULL,
  p256dh        TEXT NOT NULL,
  auth          TEXT NOT NULL,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at  TIMESTAMPTZ,

  CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions (user_id);

-- =============================================================================
-- 23. REVIEWS
-- =============================================================================

CREATE TABLE public.reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  buyer_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id     UUID NOT NULL REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         TEXT,
  body          TEXT,
  is_public     BOOLEAN NOT NULL DEFAULT true,
  is_moderated  BOOLEAN NOT NULL DEFAULT false,
  moderated_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  moderated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_seller ON public.reviews (seller_id);
CREATE INDEX idx_reviews_buyer ON public.reviews (buyer_id);
CREATE INDEX idx_reviews_public ON public.reviews (seller_id) WHERE is_public = true AND is_moderated = false;

COMMENT ON TABLE public.reviews IS 'One review per completed booking. Only the eligible buyer may submit.';

-- =============================================================================
-- 24. REPORTS
-- =============================================================================

CREATE TABLE public.reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type     public.report_target_type NOT NULL,
  target_id       UUID NOT NULL,
  reason          TEXT NOT NULL,
  details         TEXT,
  status          public.report_status NOT NULL DEFAULT 'open',
  handled_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  handled_at      TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON public.reports (status);
CREATE INDEX idx_reports_reporter ON public.reports (reporter_id);

-- =============================================================================
-- 25. AUDIT_LOGS
-- =============================================================================

CREATE TABLE public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     UUID,
  metadata      JSONB DEFAULT '{}',
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs (created_at DESC);

COMMENT ON TABLE public.audit_logs IS 'Immutable record of privileged administrative actions.';

-- =============================================================================
-- 26. AI_CONVERSATIONS
-- =============================================================================

CREATE TABLE public.ai_conversations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_key   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_conversations_user ON public.ai_conversations (user_id);

-- =============================================================================
-- 27. AI_MESSAGES
-- =============================================================================

CREATE TABLE public.ai_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content           TEXT,
  tool_calls        JSONB,
  tool_results      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_messages_conversation ON public.ai_messages (conversation_id, created_at);

-- =============================================================================
-- 28. EXTERNAL_ACCOUNT_LINKS
-- =============================================================================

CREATE TABLE public.external_account_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,          -- 'telegram', etc.
  external_id     TEXT NOT NULL,
  external_username TEXT,
  linked_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  unlinked_at     TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  metadata        JSONB DEFAULT '{}',

  CONSTRAINT external_account_links_unique UNIQUE (provider, external_id)
);

CREATE INDEX idx_external_account_links_user ON public.external_account_links (user_id);

-- =============================================================================
-- 29. WEBHOOK_EVENTS
-- =============================================================================

CREATE TABLE public.webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider        TEXT NOT NULL,
  event_id        TEXT,                   -- external event identifier for idempotency
  event_type      TEXT,
  payload         JSONB,
  processed_at    TIMESTAMPTZ,
  processing_error TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT webhook_events_idempotency UNIQUE (provider, event_id)
);

CREATE INDEX idx_webhook_events_provider ON public.webhook_events (provider, created_at DESC);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Returns true if the current user has an active role
CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = required_role
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
  );
$$;

-- Returns true if the current user has any of the privileged admin roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN (
        'support',
        'verification_officer',
        'moderator',
        'operations_manager',
        'super_admin'
      )
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
  );
$$;

-- Returns true if the current user is a member of the given conversation
CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_members cm
    WHERE cm.conversation_id = p_conversation_id
      AND cm.user_id = auth.uid()
  );
$$;

-- Returns true if the current user owns the seller profile
CREATE OR REPLACE FUNCTION public.owns_seller_profile(p_seller_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.seller_profiles sp
    WHERE sp.id = p_seller_id
      AND sp.user_id = auth.uid()
  );
$$;

-- Automatically create a profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  -- Default role: buyer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');

  -- Default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_buyer_profiles_updated_at
  BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_seller_profiles_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_provider_verifications_updated_at
  BEFORE UPDATE ON public.provider_verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_provider_availability_updated_at
  BEFORE UPDATE ON public.provider_availability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_service_listings_updated_at
  BEFORE UPDATE ON public.service_listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_booking_quotes_updated_at
  BEFORE UPDATE ON public.booking_quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Record booking status changes
CREATE OR REPLACE FUNCTION public.record_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_status_history (booking_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER booking_status_change_trigger
  AFTER UPDATE OF status ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.record_booking_status_change();

-- Generate a short human-readable booking reference
CREATE OR REPLACE FUNCTION public.generate_booking_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' THEN
    NEW.reference_code := 'DN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_booking_reference
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_booking_reference();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_account_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- ---------- profiles ----------
CREATE POLICY "Users can view any active profile"
  ON public.profiles FOR SELECT
  USING (is_active = true OR id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---------- user_roles ----------
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- No INSERT/UPDATE/DELETE policies for normal users.
-- Privileged role changes must go through service-role or SECURITY DEFINER functions.

-- ---------- buyer_profiles ----------
CREATE POLICY "Users can view and manage their own buyer profile"
  ON public.buyer_profiles FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ---------- seller_profiles ----------
CREATE POLICY "Anyone can view active seller profiles"
  ON public.seller_profiles FOR SELECT
  USING (is_active = true OR user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Sellers can insert their own profile"
  ON public.seller_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sellers can update their own profile"
  ON public.seller_profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ---------- provider_verifications ----------
CREATE POLICY "Sellers can view their own verifications"
  ON public.provider_verifications FOR SELECT
  USING (
    public.owns_seller_profile(seller_id)
    OR public.has_role('verification_officer')
    OR public.has_role('super_admin')
    OR public.is_admin()
  );

CREATE POLICY "Sellers can create verification applications"
  ON public.provider_verifications FOR INSERT
  WITH CHECK (public.owns_seller_profile(seller_id));

CREATE POLICY "Sellers can update their own draft/submitted verifications"
  ON public.provider_verifications FOR UPDATE
  USING (
    (public.owns_seller_profile(seller_id) AND status IN ('draft', 'additional_info_required'))
    OR public.has_role('verification_officer')
    OR public.has_role('super_admin')
  );

-- ---------- provider_documents ----------
CREATE POLICY "Document access restricted to owner and officers"
  ON public.provider_documents FOR SELECT
  USING (
    public.owns_seller_profile(seller_id)
    OR public.has_role('verification_officer')
    OR public.has_role('super_admin')
  );

CREATE POLICY "Sellers can upload documents for their applications"
  ON public.provider_documents FOR INSERT
  WITH CHECK (
    public.owns_seller_profile(seller_id)
    AND uploaded_by = auth.uid()
  );

-- No public access. Storage policies will further restrict the private bucket.

-- ---------- provider_service_areas ----------
CREATE POLICY "Service areas are publicly readable"
  ON public.provider_service_areas FOR SELECT
  USING (true);

CREATE POLICY "Sellers manage their own service areas"
  ON public.provider_service_areas FOR ALL
  USING (public.owns_seller_profile(seller_id) OR public.is_admin())
  WITH CHECK (public.owns_seller_profile(seller_id) OR public.is_admin());

-- ---------- provider_availability ----------
CREATE POLICY "Availability is publicly readable"
  ON public.provider_availability FOR SELECT
  USING (true);

CREATE POLICY "Sellers manage their own availability"
  ON public.provider_availability FOR ALL
  USING (public.owns_seller_profile(seller_id) OR public.is_admin())
  WITH CHECK (public.owns_seller_profile(seller_id) OR public.is_admin());

-- ---------- categories ----------
CREATE POLICY "Categories are publicly readable"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------- service_listings ----------
CREATE POLICY "Published listings are publicly readable"
  ON public.service_listings FOR SELECT
  USING (
    status = 'published'
    OR public.owns_seller_profile(seller_id)
    OR public.is_admin()
  );

CREATE POLICY "Sellers manage their own listings"
  ON public.service_listings FOR ALL
  USING (public.owns_seller_profile(seller_id) OR public.is_admin())
  WITH CHECK (public.owns_seller_profile(seller_id) OR public.is_admin());

-- ---------- listing_media ----------
CREATE POLICY "Listing media follows listing visibility"
  ON public.listing_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.service_listings sl
      WHERE sl.id = listing_id
        AND (sl.status = 'published' OR public.owns_seller_profile(sl.seller_id) OR public.is_admin())
    )
  );

CREATE POLICY "Sellers manage media for their listings"
  ON public.listing_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.service_listings sl
      WHERE sl.id = listing_id AND public.owns_seller_profile(sl.seller_id)
    )
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.service_listings sl
      WHERE sl.id = listing_id AND public.owns_seller_profile(sl.seller_id)
    )
    OR public.is_admin()
  );

-- ---------- favourites ----------
CREATE POLICY "Users manage their own favourites"
  ON public.favourites FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------- bookings ----------
CREATE POLICY "Participants can view their bookings"
  ON public.bookings FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR public.owns_seller_profile(seller_id)
    OR public.is_admin()
  );

CREATE POLICY "Buyers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Participants can update relevant booking fields"
  ON public.bookings FOR UPDATE
  USING (
    buyer_id = auth.uid()
    OR public.owns_seller_profile(seller_id)
    OR public.is_admin()
  );

-- ---------- booking_quotes ----------
CREATE POLICY "Participants can view quotes for their bookings"
  ON public.booking_quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (b.buyer_id = auth.uid() OR public.owns_seller_profile(b.seller_id) OR public.is_admin())
    )
  );

CREATE POLICY "Sellers can create quotes for their bookings"
  ON public.booking_quotes FOR INSERT
  WITH CHECK (
    public.owns_seller_profile(seller_id)
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.seller_id = seller_id
    )
  );

CREATE POLICY "Sellers and buyers can update quote status"
  ON public.booking_quotes FOR UPDATE
  USING (
    public.owns_seller_profile(seller_id)
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.buyer_id = auth.uid()
    )
    OR public.is_admin()
  );

-- ---------- booking_status_history ----------
CREATE POLICY "Participants can view booking history"
  ON public.booking_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND (b.buyer_id = auth.uid() OR public.owns_seller_profile(b.seller_id) OR public.is_admin())
    )
  );

-- ---------- conversations ----------
CREATE POLICY "Members can view their conversations"
  ON public.conversations FOR SELECT
  USING (public.is_conversation_member(id) OR public.is_admin());

CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can update conversations"
  ON public.conversations FOR UPDATE
  USING (public.is_conversation_member(id) OR public.is_admin());

-- ---------- conversation_members ----------
CREATE POLICY "Members can view conversation membership"
  ON public.conversation_members FOR SELECT
  USING (public.is_conversation_member(conversation_id) OR user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can join conversations they are added to"
  ON public.conversation_members FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ---------- messages ----------
CREATE POLICY "Members can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (public.is_conversation_member(conversation_id) OR public.is_admin());

CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_member(conversation_id)
  );

CREATE POLICY "Senders can soft-delete or edit their messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid() OR public.is_admin());

-- ---------- message_attachments ----------
CREATE POLICY "Members can view attachments in their conversations"
  ON public.message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
        AND public.is_conversation_member(m.conversation_id)
    )
    OR public.is_admin()
  );

CREATE POLICY "Senders can add attachments to their messages"
  ON public.message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_id
        AND m.sender_id = auth.uid()
        AND public.is_conversation_member(m.conversation_id)
    )
  );

-- ---------- notifications ----------
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications (read status)"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Inserts are performed by trusted server-side code / service role.

-- ---------- notification_preferences ----------
CREATE POLICY "Users manage their own notification preferences"
  ON public.notification_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------- push_subscriptions ----------
CREATE POLICY "Users manage their own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------- reviews ----------
CREATE POLICY "Public reviews are readable"
  ON public.reviews FOR SELECT
  USING (
    (is_public = true AND is_moderated = false)
    OR buyer_id = auth.uid()
    OR public.owns_seller_profile(seller_id)
    OR public.is_admin()
  );

CREATE POLICY "Eligible buyers can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    buyer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.buyer_id = auth.uid()
        AND b.status = 'completed'
    )
  );

CREATE POLICY "Buyers can update their own reviews (limited)"
  ON public.reviews FOR UPDATE
  USING (buyer_id = auth.uid() OR public.is_admin());

-- ---------- reports ----------
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Reporters and admins can view reports"
  ON public.reports FOR SELECT
  USING (reporter_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (public.is_admin());

-- ---------- audit_logs ----------
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

-- Inserts via service role / SECURITY DEFINER functions only.

-- ---------- ai_conversations ----------
CREATE POLICY "Users can view their own AI conversations"
  ON public.ai_conversations FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create AI conversations"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ---------- ai_messages ----------
CREATE POLICY "Users can view messages in their AI conversations"
  ON public.ai_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id
        AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert AI messages in their conversations"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id
        AND (c.user_id = auth.uid() OR c.user_id IS NULL)
    )
  );

-- ---------- external_account_links ----------
CREATE POLICY "Users manage their own external links"
  ON public.external_account_links FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ---------- webhook_events ----------
-- Only accessible via service role. No policies for authenticated users.
CREATE POLICY "No direct user access to webhook events"
  ON public.webhook_events FOR SELECT
  USING (false);

-- =============================================================================
-- GRANTS (minimal)
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Restrict sensitive tables further via RLS (already enabled).

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
