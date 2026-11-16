import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { getSellerListing } from "@/features/seller/lib/queries";
import { isSeller } from "@/lib/permissions";
import { getCategories } from "@/features/marketplace/lib/queries";
import { ListingForm } from "@/features/seller/components/listing-form";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/listings");
  if (!isSeller(ctx.user) || !ctx.profile) redirect("/seller/dashboard");

  const { data: listing } = await getSellerListing(ctx.profile.id, id);
  if (!listing) notFound();

  const { data: categories } = await getCategories();

  return (
    <main className="dashboard-page">
      <h1>Edit listing</h1>
      <ListingForm categories={categories} mode="edit" listing={listing} />
    </main>
  );
}
