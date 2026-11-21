"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./schemas";
import { mapAuthError } from "./lib/map-auth-error";
import { safeInternalPath } from "@/lib/safe-redirect";
import { getSiteUrl } from "@/lib/site-url";

export type AuthActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (key === "acceptTerms") {
      obj[key] = value === "on" || value === "true" || value === "1";
    } else {
      obj[key] = typeof value === "string" ? value : String(value);
    }
  });
  return obj;
}

/**
 * Register with email + password. Sends confirmation email.
 * Profile row is created by DB trigger on auth.users insert (and upserted in callback).
 */
export async function registerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = formDataToObject(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the errors below.",
    };
  }

  const { fullName, email, password } = parsed.data;
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/seller`,
    },
  });

  if (error) {
    return { ok: false, message: mapAuthError(error) };
  }

  // If email confirmation is disabled in Supabase, session may already exist
  if (data.session) {
    redirect("/seller");
  }

  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

/**
 * Login with email + password.
 */
export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = formDataToObject(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the errors below.",
    };
  }

  const { email, password } = parsed.data;
  const requestedNext = String(formData.get("next") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: mapAuthError(error) };
  }

  // Honour an explicit ?next=; otherwise send admins to the admin console and everyone else to /seller
  if (requestedNext) {
    redirect(safeInternalPath(requestedNext, "/seller"));
  }
  const { data: isAdmin } = await supabase.rpc("is_admin");
  redirect(isAdmin === true ? "/admin" : "/seller");
}

/**
 * Send password recovery email.
 */
export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = formDataToObject(formData);
  const parsed = forgotPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please enter a valid email.",
    };
  }

  const { email } = parsed.data;
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { ok: false, message: mapAuthError(error) };
  }

  // Same message whether or not the email exists (avoid account enumeration)
  return {
    ok: true,
    message:
      "If an account exists for that email, we sent a password reset link. Check your inbox.",
  };
}

/**
 * Set a new password after recovery link (user must have a recovery session).
 */
export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = formDataToObject(formData);
  const parsed = resetPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Please fix the errors below.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Your reset session has expired. Please request a new password reset link.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: mapAuthError(error) };
  }

  redirect("/seller");
}

/**
 * Resend confirmation email.
 */
export async function resendConfirmationAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/seller`,
    },
  });

  if (error) {
    return { ok: false, message: mapAuthError(error) };
  }

  return {
    ok: true,
    message: "Confirmation email sent. Check your inbox and spam folder.",
  };
}

/**
 * Logout and clear session.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Ensure a profile row exists for the current user (idempotent upsert).
 * Called from the auth callback after successful verification.
 * Never trusts client-supplied user IDs.
 */
export async function ensureProfile(userId: string, email?: string | null, fullName?: string | null) {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: email ?? null,
      full_name: fullName ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    // Log server-side only; do not fail the whole auth flow if profile already exists via trigger
    console.error("ensureProfile error:", error.message);
  }
}
