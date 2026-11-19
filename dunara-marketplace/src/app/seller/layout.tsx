export const dynamic = "force-dynamic";
export const revalidate = 0;

import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { SellerNav } from "@/features/seller/components/SellerNav";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/seller");
  const shop = await getOwnShop(user.id);

  return (
    <div className="min-h-[70vh] bg-[var(--color-canvas)]">
      <SellerNav email={user.email} shopName={shop?.name ?? null} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
