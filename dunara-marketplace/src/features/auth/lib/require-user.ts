import { redirect } from "next/navigation";
import { getUser } from "./get-user";
import type { User } from "@supabase/supabase-js";

/**
 * Server-side guard. Redirects to /login with a safe return path if unauthenticated.
 */
export async function requireUser(returnTo?: string): Promise<User> {
  const user = await getUser();
  if (!user) {
    const path = returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login";
    redirect(path);
  }
  return user;
}
