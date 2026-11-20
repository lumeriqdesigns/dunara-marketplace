import type { Metadata } from "next";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { PageHeader } from "@/features/seller/components/PageHeader";
import {
  getActivePlans,
  getShopEntitlement,
  expireTrials,
} from "@/features/billing/lib/subscription-service";
import { countPublishedListings } from "@/features/listings/lib/get-listings";
import { BillingPanel } from "@/features/billing/components/BillingPanel";
import Link from "next/link";

export const metadata: Metadata = { title: "Billing" };

export default async function SellerBillingPage() {
  const user = await requireUser("/seller/billing");
  const shop = await getOwnShop(user.id);

  await expireTrials();

  if (!shop) {
    return (
      <div className="space-y-4">
        <PageHeader title="Billing" description="Create a shop to manage your plan." />
        <Link
          href="/seller/shop"
          className="inline-flex min-h-11 items-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
        >
          Create your shop
        </Link>
      </div>
    );
  }

  const [entitlement, plans, publishedCount] = await Promise.all([
    getShopEntitlement(shop.id),
    getActivePlans(),
    countPublishedListings(shop.id),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Seller subscriptions only — no commission on WhatsApp sales."
      />
      <BillingPanel
        entitlement={entitlement}
        plans={plans}
        publishedCount={publishedCount}
      />
    </div>
  );
}
