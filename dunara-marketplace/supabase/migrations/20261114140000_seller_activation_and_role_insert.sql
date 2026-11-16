-- =============================================================================
-- Dúnarà Marketplace — Seller self-activation (safe path)
-- Phase 3.1: SECURITY DEFINER activate_seller_role + narrow RLS INSERT policy
-- Owner: Lumeriq Designs
-- =============================================================================
-- Goals:
--   • Authenticated users may activate ONLY the 'seller' role for themselves
--   • Privileged roles remain without any client INSERT path
--   • Function is idempotent and optionally audits the activation
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SECURITY DEFINER function: activate_seller_role()
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.activate_seller_role()
RETURNS public.user_roles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_roles;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required to activate seller role'
      USING ERRCODE = '42501';
  END IF;

  -- Idempotent: return existing active seller role if present
  SELECT *
  INTO v_row
  FROM public.user_roles
  WHERE user_id = v_uid
    AND role = 'seller'
    AND is_active = true
    AND revoked_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    RETURN v_row;
  END IF;

  -- Insert only seller for the current user
  INSERT INTO public.user_roles (user_id, role, is_active, granted_by)
  VALUES (v_uid, 'seller', true, v_uid)
  RETURNING * INTO v_row;

  -- Light audit entry (best-effort; do not fail activation if audit insert fails)
  BEGIN
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      v_uid,
      'user_roles.seller_activated',
      'user_roles',
      v_row.id,
      jsonb_build_object('role', 'seller', 'user_id', v_uid)
    );
  EXCEPTION
    WHEN OTHERS THEN
      NULL; -- activation still succeeds
  END;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_seller_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_seller_role() TO authenticated;

COMMENT ON FUNCTION public.activate_seller_role() IS
  'Allows the authenticated user to activate the seller role for themselves only. Idempotent. Privileged roles cannot be granted through this function.';

-- -----------------------------------------------------------------------------
-- 2. Narrow RLS INSERT policy on user_roles (defence in depth)
--    Only allows inserting role = 'seller' for auth.uid().
--    Privileged roles still have no usable INSERT path for normal clients.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can activate their own seller role" ON public.user_roles;

CREATE POLICY "Users can activate their own seller role"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'seller'::public.user_role
    AND is_active = true
  );

COMMENT ON POLICY "Users can activate their own seller role" ON public.user_roles IS
  'Narrow INSERT: authenticated user may only insert an active seller role for themselves. Prefer calling activate_seller_role() from application code.';

-- SELECT policy already exists ("Users can view their own roles").
-- No UPDATE/DELETE policies for normal users on user_roles.

-- =============================================================================
-- END
-- =============================================================================
