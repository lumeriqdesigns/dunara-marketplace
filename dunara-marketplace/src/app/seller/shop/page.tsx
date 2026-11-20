import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/features/seller/components/PageHeader";
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
        <PageHeader
          title="Create your shop"
          description="Start with a name, category, and what you offer. You can add WhatsApp, location, logo, and bio next, then publish when you’re ready."
        />
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
      <PageHeader
        title={shop.name}
        description="Manage your public shop profile."
        actions={
          shop.is_published ? (
            <Link
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noreferrer"
              className="interactive inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-soft-green)]"
            >
              View public shop
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          ) : null
        }
      />
      <ShopEditForm shop={shop} categories={categories} />
    </div>
  );
}
