import { createClient } from "@/lib/supabase/server";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { isSeller, isAdmin } from "@/lib/permissions";

export type SellerProfile = {
  id: string;
  user_id: string;
  business_name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  email_public: string | null;
  years_experience: number | null;
  is_verified: boolean;
  verification_level: string | null;
  average_rating: number;
  review_count: number;
  completed_bookings: number;
  is_active: boolean;
  is_accepting_work: boolean;
  created_at: string;
  updated_at: string;
};

export type SellerContext = {
  user: SessionUser;
  profile: SellerProfile | null;
};

/**
 * Load authenticated seller context. Does not create a profile.
 * Admins may access seller tools but still only mutate via explicit policies.
 */
export async function getSellerContext(): Promise<SellerContext | null> {
  const user = await getSessionUser();
  if (!user) return null;
  if (!isSeller(user) && !isAdmin(user)) {
    return { user, profile: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seller_profiles")
    .select(
      `
      id, user_id, business_name, slug, tagline, description,
      logo_url, cover_image_url, website, phone, whatsapp_number, email_public,
      years_experience, is_verified, verification_level,
      average_rating, review_count, completed_bookings,
      is_active, is_accepting_work, created_at, updated_at
    `
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getSellerContext profile error:", error.message);
    return { user, profile: null };
  }

  return {
    user,
    profile: data
      ? {
          ...data,
          average_rating: Number(data.average_rating) || 0
        }
      : null
  };
}

/**
 * Require seller role + own profile for mutating own business data.
 */
export async function requireOwnSellerProfile(): Promise<{
  user: SessionUser;
  profile: SellerProfile;
}> {
  const ctx = await getSellerContext();
  if (!ctx?.user) {
    throw new Error("UNAUTHENTICATED");
  }
  if (!isSeller(ctx.user) && !isAdmin(ctx.user)) {
    throw new Error("FORBIDDEN_NOT_SELLER");
  }
  if (!ctx.profile) {
    throw new Error("SELLER_PROFILE_REQUIRED");
  }
  // Isolation: profile must belong to session user (admins view-only via other paths)
  if (ctx.profile.user_id !== ctx.user.id && !isAdmin(ctx.user)) {
    throw new Error("FORBIDDEN_NOT_OWNER");
  }
  if (ctx.profile.user_id !== ctx.user.id) {
    // Admin without ownership cannot use this helper for mutations
    throw new Error("FORBIDDEN_NOT_OWNER");
  }
  return { user: ctx.user, profile: ctx.profile };
}

export function slugifyBusinessName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
