import { createClient } from "@/lib/supabase/server";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { canAccessBuyerDashboard } from "@/lib/permissions";

export type BuyerProfile = {
  id: string;
  user_id: string;
  preferred_city: string | null;
  preferred_state: string | null;
  notes: string | null;
};

export type UserProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type BuyerContext = {
  user: SessionUser;
  profile: UserProfile | null;
  buyerProfile: BuyerProfile | null;
};

export async function getBuyerContext(): Promise<BuyerContext | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (!canAccessBuyerDashboard(user)) {
    return { user, profile: null, buyerProfile: null };
  }

  const supabase = await createClient();
  const [{ data: profile }, { data: buyerProfile }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, email, phone, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("buyer_profiles")
      .select("id, user_id, preferred_city, preferred_state, notes")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  return {
    user,
    profile: profile as UserProfile | null,
    buyerProfile: buyerProfile as BuyerProfile | null
  };
}

export async function requireBuyer(): Promise<{
  user: SessionUser;
  profile: UserProfile | null;
  buyerProfile: BuyerProfile | null;
}> {
  const ctx = await getBuyerContext();
  if (!ctx?.user) throw new Error("UNAUTHENTICATED");
  if (!canAccessBuyerDashboard(ctx.user)) throw new Error("FORBIDDEN");
  return ctx;
}
