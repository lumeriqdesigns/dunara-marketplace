import { createClient } from "@/lib/supabase/server";
import type { Shop, Category, Listing } from "@/types";

export type ShopWithCategory = Shop & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export async function getOwnShop(userId: string): Promise<ShopWithCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shops")
    .select("*, categories(id, name, slug)")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getOwnShop:", error.message);
    return null;
  }
  return data as ShopWithCategory | null;
}

export async function getPublicShopBySlug(
  slug: string
): Promise<(ShopWithCategory & { listings?: Listing[] }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shops")
    .select(
      `
      *,
      categories(id, name, slug),
      listings(*)
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .eq("is_suspended", false)
    .maybeSingle();

  if (error) {
    console.error("getPublicShopBySlug:", error.message);
    return null;
  }

  if (!data) return null;

  // Only published listings
  const listings = ((data as { listings?: Listing[] }).listings ?? []).filter(
    (l) => l.is_published
  );

  return { ...(data as ShopWithCategory), listings };
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories:", error.message);
    return [];
  }
  return (data ?? []) as Category[];
}

export async function isSlugAvailable(
  slug: string,
  excludeShopId?: string
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase.from("shops").select("id").eq("slug", slug);
  if (excludeShopId) {
    query = query.neq("id", excludeShopId);
  }
  const { data } = await query.maybeSingle();
  return !data;
}
