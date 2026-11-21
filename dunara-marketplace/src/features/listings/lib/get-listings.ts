import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingMedia, Shop, Category } from "@/types";

export type ListingWithMedia = Listing & {
  listing_media?: ListingMedia[];
  categories?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type PublicListingDetail = ListingWithMedia & {
  shops: Pick<
    Shop,
    | "id"
    | "name"
    | "slug"
    | "phone"
    | "city"
    | "state"
    | "logo_url"
    | "verification_status"
    | "is_published"
    | "is_suspended"
    | "created_at"
  > | null;
};

export async function getShopListings(
  shopId: string,
  opts?: { q?: string; status?: "all" | "published" | "draft" }
): Promise<Listing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*")
    .eq("shop_id", shopId)
    .order("updated_at", { ascending: false });

  if (opts?.status === "published") query = query.eq("is_published", true);
  if (opts?.status === "draft") query = query.eq("is_published", false);
  if (opts?.q?.trim()) {
    query = query.ilike("title", `%${opts.q.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getShopListings:", error.message);
    return [];
  }
  return (data ?? []) as Listing[];
}

export async function getOwnListing(
  listingId: string,
  shopId: string
): Promise<ListingWithMedia | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_media(*), categories(id, name, slug)")
    .eq("id", listingId)
    .eq("shop_id", shopId)
    .maybeSingle();

  if (error) {
    console.error("getOwnListing:", error.message);
    return null;
  }
  return data as ListingWithMedia | null;
}

export async function getPublicListing(
  shopSlug: string,
  listingSlug: string
): Promise<PublicListingDetail | null> {
  const supabase = await createClient();

  // Resolve published non-suspended shop first
  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug, phone, city, state, logo_url, verification_status, is_published, is_suspended, created_at")
    .eq("slug", shopSlug)
    .eq("is_published", true)
    .eq("is_suspended", false)
    .maybeSingle();

  if (!shop) return null;

  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_media(*), categories(id, name, slug)")
    .eq("shop_id", shop.id)
    .eq("slug", listingSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;

  // Sort media by sort_order
  const media = ((data as ListingWithMedia).listing_media ?? []).slice().sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return {
    ...(data as ListingWithMedia),
    listing_media: media,
    shops: shop as PublicListingDetail["shops"],
  };
}

export async function countPublishedListings(shopId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shopId)
    .eq("is_published", true);

  if (error) return 0;
  return count ?? 0;
}

export async function isListingSlugAvailable(
  shopId: string,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("id")
    .eq("shop_id", shopId)
    .eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return !data;
}
