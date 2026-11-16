"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canSelfAssign, isPrivilegedRole } from "@/lib/permissions";
import type { MarketplaceRole } from "@/lib/permissions/roles";
import { mapClientError, logServerError } from "@/lib/security/errors";
import { checkRateLimitAsync, RateLimits } from "@/lib/security/rate-limit";

export type AuthActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

function mapAuthError(message: string): string {
  return mapClientError(message, "Something went wrong. Please try again.");
}

/**
 * Register a new user with email + password.
 * Profile + default buyer role are created by the database trigger handle_new_user().
 */
export async function registerWithEmail(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || undefined,
        display_name: fullName || email.split("@")[0]
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`
    }
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  // If email confirmation is required, session may be null
  if (data.user && !data.session) {
    return {
      ok: true,
      message: "Check your email to verify your account before signing in."
    };
  }

  return { ok: true, message: "Account created. You can continue." };
}

/**
 * Sign in with email + password.
 */
export async function loginWithEmail(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const rl = await checkRateLimitAsync(
    `auth:login:${email}`,
    RateLimits.auth.limit,
    RateLimits.auth.windowMs
  );
  if (!rl.ok) {
    return {
      ok: false,
      error: `Too many sign-in attempts. Try again in ${rl.retryAfterSeconds}s.`
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  return { ok: true };
}

/**
 * Sign out and clear the session.
 */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Request a password reset email.
 */
export async function requestPasswordReset(formData: FormData): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { ok: false, error: "Email is required." };
  }

  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  // Always return success-style message to avoid email enumeration
  return {
    ok: true,
    message: "If an account exists for that email, a reset link has been sent."
  };
}

/**
 * Update password after recovery (user must have a recovery session).
 */
export async function updatePassword(formData: FormData): Promise<AuthActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  return { ok: true, message: "Password updated. You can continue." };
}

/**
 * Activate the seller role for the current user.
 * Uses SECURITY DEFINER RPC `activate_seller_role()` so the insert is constrained
 * in the database (only role = seller for auth.uid()). Idempotent.
 * Privileged roles cannot be granted through this path.
 */
export async function activateSellerRole(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data, error } = await supabase.rpc("activate_seller_role");

  if (error) {
    console.error("activateSellerRole error:", error.message);
    return {
      ok: false,
      error: "Could not activate seller role. Please try again or contact support."
    };
  }

  if (data) {
    return { ok: true, message: "Seller role activated." };
  }

  return { ok: true, message: "Seller role is already active." };
}

/**
 * Trusted server-side grant of a privileged role.
 * This must only be called from code that has already verified the actor is a super_admin
 * (or equivalent). It uses the user's session client; for true service-role grants
 * use a separate admin Edge Function with the service key (never exposed here).
 *
 * For MVP we deliberately do NOT expose a general "grant any role" action from the browser.
 * Super-admin provisioning should be done via a one-time secure script or Edge Function.
 */
export async function grantPrivilegedRole(_formData: FormData): Promise<AuthActionResult> {
  // Hard block: no client-callable path for privileged role grants in this foundation.
  return {
    ok: false,
    error: "Privileged roles can only be granted through a trusted server-side provisioning process."
  };
}
