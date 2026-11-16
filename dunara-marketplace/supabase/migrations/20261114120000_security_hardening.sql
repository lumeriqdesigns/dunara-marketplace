-- =============================================================================
-- Dúnarà Marketplace — Security Hardening Migration
-- Phase 2.1: Protect privileged columns, enforce booking transitions,
--            harden seller profile updates, improve role uniqueness.
-- Owner: Lumeriq Designs
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. IMPROVE user_roles UNIQUENESS MODEL
--    Previous UNIQUE NULLS NOT DISTINCT (user_id, role, is_active) could allow
--    multiple inactive rows. We want at most one active row per (user_id, role)
--    and still keep history of revoked roles.
-- -----------------------------------------------------------------------------

-- Drop the old constraint if it exists
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_unique_active;

-- Partial unique index: only one active role membership per user+role
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_one_active_per_role
  ON public.user_roles (user_id, role)
  WHERE is_active = true AND revoked_at IS NULL;

COMMENT ON INDEX public.user_roles_one_active_per_role IS
  'Ensures a user can have at most one active membership for each role.';

-- -----------------------------------------------------------------------------
-- 2. PROTECT seller_profiles.is_verified AND verification_level
--    Sellers must never be able to set these themselves.
--    Only verification_officer or super_admin (via trusted path) may change them.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.protect_seller_verification_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_privileged BOOLEAN;
BEGIN
  -- Allow if the privileged columns are unchanged
  IF NEW.is_verified IS NOT DISTINCT FROM OLD.is_verified
     AND NEW.verification_level IS NOT DISTINCT FROM OLD.verification_level THEN
    RETURN NEW;
  END IF;

  -- Check whether the current user is allowed to change verification flags
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('verification_officer', 'super_admin')
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
  ) INTO is_privileged;

  -- Also allow service_role (auth.uid() is null in many service-role contexts)
  IF auth.uid() IS NULL THEN
    -- Service role / migration context — permitted
    RETURN NEW;
  END IF;

  IF NOT is_privileged THEN
    RAISE EXCEPTION 'Permission denied: only verification officers or super admins may change is_verified or verification_level'
      USING ERRCODE = '42501'; -- insufficient_privilege
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_seller_verification_columns_trigger ON public.seller_profiles;
CREATE TRIGGER protect_seller_verification_columns_trigger
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_seller_verification_columns();

COMMENT ON FUNCTION public.protect_seller_verification_columns() IS
  'Prevents sellers (and any non-officer) from self-setting is_verified or verification_level.';

-- -----------------------------------------------------------------------------
-- 3. SECURITY DEFINER FUNCTION FOR OFFICIAL VERIFICATION DECISIONS
--    Officers should call this (or an equivalent server-side path) so that
--    the change is audited.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_seller_verification(
  p_seller_id UUID,
  p_is_verified BOOLEAN,
  p_verification_level public.verification_level DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.seller_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor UUID := auth.uid();
  v_result public.seller_profiles;
BEGIN
  -- Only verification_officer or super_admin
  IF NOT (
    public.has_role('verification_officer') OR public.has_role('super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: verification decision requires verification_officer or super_admin'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.seller_profiles
  SET
    is_verified = p_is_verified,
    verification_level = COALESCE(p_verification_level, verification_level),
    updated_at = now()
  WHERE id = p_seller_id
  RETURNING * INTO v_result;

  IF v_result.id IS NULL THEN
    RAISE EXCEPTION 'Seller profile not found: %', p_seller_id;
  END IF;

  -- Audit log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    v_actor,
    CASE WHEN p_is_verified THEN 'seller.verification.approved' ELSE 'seller.verification.revoked' END,
    'seller_profiles',
    p_seller_id,
    jsonb_build_object(
      'is_verified', p_is_verified,
      'verification_level', p_verification_level,
      'notes', p_notes
    )
  );

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.set_seller_verification FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_seller_verification TO authenticated;

COMMENT ON FUNCTION public.set_seller_verification IS
  'Authorised path for verification officers / super admins to set seller verification flags. Writes an audit log entry.';

-- -----------------------------------------------------------------------------
-- 4. ENFORCE LEGAL BOOKING STATUS TRANSITIONS
--    Role-aware BEFORE UPDATE trigger.
--    Existing history trigger remains in place.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enforce_booking_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_is_buyer BOOLEAN;
  v_is_seller BOOLEAN;
  v_is_admin BOOLEAN;
  v_allowed BOOLEAN := false;
BEGIN
  -- No change → allow
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  -- Service role / system context
  IF v_uid IS NULL THEN
    RETURN NEW;
  END IF;

  v_is_buyer := (OLD.buyer_id = v_uid);
  v_is_seller := public.owns_seller_profile(OLD.seller_id);
  v_is_admin := public.is_admin();

  -- Admin can perform any transition (still recorded in history)
  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  -- Legal transitions matrix (role-aware)
  CASE OLD.status
    WHEN 'requested' THEN
      -- Seller may accept, decline, or move to quoted
      -- Buyer may cancel
      IF v_is_seller AND NEW.status IN ('accepted', 'declined', 'quoted') THEN
        v_allowed := true;
      ELSIF v_is_buyer AND NEW.status = 'cancelled' THEN
        v_allowed := true;
      END IF;

    WHEN 'quoted' THEN
      -- Buyer may accept or reject the quote (→ accepted / declined)
      -- Seller may withdraw / re-quote (stay in quoted or decline)
      -- Either party may cancel
      IF v_is_buyer AND NEW.status IN ('accepted', 'declined', 'cancelled') THEN
        v_allowed := true;
      ELSIF v_is_seller AND NEW.status IN ('quoted', 'declined', 'cancelled') THEN
        v_allowed := true;
      END IF;

    WHEN 'accepted' THEN
      -- Move toward confirmation
      IF (v_is_buyer OR v_is_seller) AND NEW.status IN ('awaiting_confirmation', 'confirmed', 'cancelled') THEN
        v_allowed := true;
      END IF;

    WHEN 'awaiting_confirmation' THEN
      IF (v_is_buyer OR v_is_seller) AND NEW.status IN ('confirmed', 'cancelled') THEN
        v_allowed := true;
      END IF;

    WHEN 'confirmed' THEN
      -- Seller starts work; either party may cancel (business rules can refine later)
      IF v_is_seller AND NEW.status IN ('in_progress', 'cancelled') THEN
        v_allowed := true;
      ELSIF v_is_buyer AND NEW.status = 'cancelled' THEN
        v_allowed := true;
      END IF;

    WHEN 'in_progress' THEN
      -- Seller (or buyer agreement) may complete; either may raise dispute or cancel
      IF v_is_seller AND NEW.status IN ('completed', 'cancelled', 'disputed') THEN
        v_allowed := true;
      ELSIF v_is_buyer AND NEW.status IN ('cancelled', 'disputed') THEN
        v_allowed := true;
      END IF;

    WHEN 'completed' THEN
      -- Completed is largely terminal. Only admin may reopen / dispute after the fact.
      -- (Reviews are controlled separately by review INSERT policy.)
      v_allowed := false;

    WHEN 'declined', 'cancelled', 'disputed' THEN
      -- Terminal for normal users
      v_allowed := false;

    ELSE
      v_allowed := false;
  END CASE;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid booking status transition from % to % for this actor',
      OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;

  -- Side effects for terminal-ish states
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
  END IF;

  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
    NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_booking_status_transition_trigger ON public.bookings;
CREATE TRIGGER enforce_booking_status_transition_trigger
  BEFORE UPDATE OF status ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_booking_status_transition();

COMMENT ON FUNCTION public.enforce_booking_status_transition() IS
  'Role-aware enforcement of legal booking status transitions. Admins bypass; buyers and sellers have restricted paths. History trigger still records the change.';

-- -----------------------------------------------------------------------------
-- 5. HARDEN seller_profiles UPDATE POLICY (defence in depth)
--    Even if application code is buggy, the trigger above blocks verification
--    columns. We also document the safe column set.
-- -----------------------------------------------------------------------------

-- The existing UPDATE policy already restricts to owner or admin.
-- The trigger is the primary protection for is_verified / verification_level.
-- average_rating, review_count, completed_bookings should also be system-managed.

CREATE OR REPLACE FUNCTION public.protect_seller_stats_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Block non-privileged users from manually altering aggregate stats
  IF (NEW.average_rating IS DISTINCT FROM OLD.average_rating
      OR NEW.review_count IS DISTINCT FROM OLD.review_count
      OR NEW.completed_bookings IS DISTINCT FROM OLD.completed_bookings)
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Permission denied: average_rating, review_count and completed_bookings are system-managed'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_seller_stats_columns_trigger ON public.seller_profiles;
CREATE TRIGGER protect_seller_stats_columns_trigger
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_seller_stats_columns();

-- -----------------------------------------------------------------------------
-- 6. TIGHTEN GRANTS (least privilege documentation + explicit revoke where needed)
--    Authenticated users keep table access; RLS remains the real gate.
--    Explicitly revoke dangerous defaults on sensitive tables from anon.
-- -----------------------------------------------------------------------------

-- Anon should not be able to write anything sensitive
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.webhook_events FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.provider_documents FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.provider_verifications FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.bookings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.messages FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.reviews FROM anon;

-- Authenticated still relies on RLS; no broad REVOKE that would break legitimate paths.

-- -----------------------------------------------------------------------------
-- 7. GUEST AI CONVERSATION BEHAVIOUR
--    Documented: user_id IS NULL is permitted for anonymous AI sessions.
--    Policies already allow INSERT when user_id IS NULL.
--    Add a comment for clarity.
-- -----------------------------------------------------------------------------

COMMENT ON COLUMN public.ai_conversations.user_id IS
  'Nullable. NULL means a guest (unauthenticated) AI session. Guest sessions must not expose private user data and should be rate-limited at the application layer.';

-- -----------------------------------------------------------------------------
-- 8. HELPER: safe column list note for application developers
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.seller_profiles IS
  'Business-facing seller profile. is_verified and verification_level may only be changed by verification_officer/super_admin (enforced by trigger + set_seller_verification()). average_rating, review_count, completed_bookings are system-managed.';

-- =============================================================================
-- END OF SECURITY HARDENING MIGRATION
-- =============================================================================
