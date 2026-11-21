export const dynamic = "force-dynamic";
export const revalidate = 0;

import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { SellerNav, SellerTopBar } from "@/features/seller/components/SellerNav";
import { getShopEntitlement } from "@/features/billing/lib/subscription-service";
import { OPEN_ENTITLEMENT } from "@/features/billing/lib/entitlements";
import { PlanProvider } from "@/features/billing/components/PlanProvider";
import { PlanStatusBanner } from "@/features/billing/components/PlanStatusBanner";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/seller");
  const shop = await getOwnShop(user.id);
  // Resolved on the server from the database. Client components read it via usePlan().
  const entitlement = shop ? await getShopEntitlement(shop.id) : OPEN_ENTITLEMENT;

  return (
    <div className="workspace-shell min-h-screen text-[var(--color-ink)]">
      <div className="flex min-h-screen">
        <SellerNav email={user.email} shopName={shop?.name ?? null} />
        <div className="flex min-w-0 flex-1 flex-col">
          <SellerTopBar />
          <PlanProvider entitlement={entitlement} asOf={new Date().toISOString()}>
            <div className="workspace-content mx-auto flex-1">
              <PlanStatusBanner />
              {children}
            </div>
          </PlanProvider>
        </div>
      </div>
    </div>
  );
}
