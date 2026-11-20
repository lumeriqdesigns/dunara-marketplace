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
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="flex min-h-screen">
        <SellerNav email={user.email} shopName={shop?.name ?? null} />
        <div className="flex min-w-0 flex-1 flex-col">
          <SellerTopBar />
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
