import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/features/auth/lib/get-user";

export type AdminUser = User;

/**
 * Server-side admin guard.
 * Uses authenticated session + user_roles via is_admin() RPC / table.
 * Never trust client role claims or user_metadata.
 */
export async function requireAdmin(returnTo = "/admin"): Promise<AdminUser> {
  const user = await getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    // Fallback: direct table read under RLS (own row or admin policy)
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      redirect("/seller");
    }
    return user;
  }

  if (data !== true) {
    redirect("/seller");
  }

  return user;
}

/**
 * Non-redirecting check for server actions that should return typed errors.
 */
export async function getAdminOrNull(): Promise<AdminUser | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (!error && data === true) return user;

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  return roleRow ? user : null;
}

export async function assertAdmin(): Promise<
  { ok: true; user: AdminUser } | { ok: false; message: string }
> {
  const user = await getAdminOrNull();
  if (!user) {
    return { ok: false, message: "Admin access required." };
  }
  return { ok: true, user };
}
