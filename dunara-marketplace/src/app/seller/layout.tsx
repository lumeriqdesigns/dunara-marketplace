export const dynamic = "force-dynamic";
export const revalidate = 0;

import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { SellerNav, SellerTopBar } from "@/features/seller/components/SellerNav";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/seller");
  const shop = await getOwnShop(user.id);

  return (
    <div className="workspace-shell min-h-screen text-[var(--color-ink)]">
      <div className="flex min-h-screen">
        <SellerNav email={user.email} shopName={shop?.name ?? null} />
        <div className="flex min-w-0 flex-1 flex-col">
          <SellerTopBar />
          <div className="workspace-content mx-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
