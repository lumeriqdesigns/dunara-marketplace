import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop, getCategories } from "@/features/shop/lib/get-shop";
import { ShopCreateForm } from "@/features/shop/components/ShopCreateForm";
import { ShopEditForm } from "@/features/shop/components/ShopEditForm";

export const metadata: Metadata = {
  title: "Your shop",
};

export default async function SellerShopPage() {
  const user = await requireUser("/seller/shop");
  const [shop, categories] = await Promise.all([
    getOwnShop(user.id),
    getCategories(),
  ]);

  if (!shop) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
            Create your shop
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            Start with a name, category, and what you offer. You can add WhatsApp,
            location, logo, and bio next — then publish when ready.
          </p>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-[var(--color-error)]">
            No categories found. Run the database seed script first.
          </p>
        ) : (
          <ShopCreateForm categories={categories} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
            {shop.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Manage your public shop profile
          </p>
        </div>
        <Link
          href="/seller"
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Seller home
        </Link>
      </div>
      <ShopEditForm shop={shop} categories={categories} />
    </div>
  );
}
