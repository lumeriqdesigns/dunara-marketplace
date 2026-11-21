import { createClient } from "@/lib/supabase/server";
import type { Shop } from "@/types";
import { TIERS } from "@/config/plans";
import {
  getShopEntitlement,
  expireTrials,
} from "@/features/billing/lib/subscription-service";

export type SellerDashboardStats = {
  totalListings: number;
  publishedListings: number;
  draftListings: number;
  shop: Shop | null;
  planLabel: string;
  listingLimit: number;
  planStatus: string;
};

export async function getSellerDashboardStats(
  shop: Shop | null
): Promise<SellerDashboardStats> {
  if (!shop) {
    return {
      totalListings: 0,
      publishedListings: 0,
      draftListings: 0,
      shop: null,
      planLabel: TIERS.open.name,
      listingLimit: TIERS.open.limits.publishedListings,
      planStatus: "free",
    };
  }

  await expireTrials();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, is_published")
    .eq("shop_id", shop.id);

  if (error) {
    console.error("getSellerDashboardStats:", error.message);
  }

  const rows = data ?? [];
  const published = rows.filter((r) => r.is_published).length;
  const entitlement = await getShopEntitlement(shop.id);

  return {
    totalListings: rows.length,
    publishedListings: published,
    draftListings: rows.length - published,
    shop,
    planLabel: entitlement.isTrialing
      ? `${entitlement.planName} (trial)`
      : entitlement.planName,
    listingLimit: entitlement.listingLimit,
    planStatus: entitlement.status,
  };
}
