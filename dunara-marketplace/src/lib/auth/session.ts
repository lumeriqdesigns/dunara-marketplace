import { createClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/lib/permissions";
import type { MarketplaceRole } from "@/lib/permissions/roles";

/**
 * Load the current authenticated user and their active roles from the database.
 * Uses the anon key + user session (never the service-role key).
 *
 * Suspended accounts (profiles.is_active = false) are treated as unauthenticated
 * for application purposes so suspension is effective without waiting for JWT expiry.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Enforce account suspension
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load profile for session:", profileError.message);
    // Fail closed for privileged use: no roles if we cannot verify active status
    return {
      id: user.id,
      email: user.email ?? null,
      roles: []
    };
  }

  if (profile && profile.is_active === false) {
    return null;
  }

  const { data: roleRows, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .is("revoked_at", null);

  if (rolesError) {
    console.error("Failed to load user roles:", rolesError.message);
    return {
      id: user.id,
      email: user.email ?? null,
      roles: []
    };
  }

  const roles = (roleRows ?? [])
    .map((r) => r.role as MarketplaceRole)
    .filter(Boolean);

  return {
    id: user.id,
    email: user.email ?? null,
    roles
  };
}

/**
 * Require an authenticated session. Returns the user or null.
 */
export async function requireSession(): Promise<SessionUser | null> {
  return getSessionUser();
}
