import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { isSeller } from "@/lib/permissions";
import { getCategories } from "@/features/marketplace/lib/queries";
import { ListingForm } from "@/features/seller/components/listing-form";

export const metadata: Metadata = { title: "New listing" };

export default async function NewListingPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/listings/new");
  if (!isSeller(ctx.user) || !ctx.profile) redirect("/seller/dashboard");

  const { data: categories } = await getCategories();

  return (
    <main className="sel-page">
      <h1>New listing</h1>
      <ListingForm categories={categories} mode="create" />
    </main>
  );
}
