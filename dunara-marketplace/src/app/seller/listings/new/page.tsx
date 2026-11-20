import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop, getCategories } from "@/features/shop/lib/get-shop";
import { ListingForm } from "@/features/listings/components/ListingForm";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "New listing" };

export default async function NewListingPage() {
  const user = await requireUser("/seller/listings/new");
  const shop = await getOwnShop(user.id);
  if (!shop) redirect("/seller/shop");
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">New listing</h1>
        <Link href="/seller/listings" className="text-sm text-[var(--color-primary)]">
          ← All listings
        </Link>
      </div>
      <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <ListingForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
