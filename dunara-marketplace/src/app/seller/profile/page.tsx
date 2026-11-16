import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { isSeller } from "@/lib/permissions";
import { ProfileForm } from "@/features/seller/components/profile-form";

export const metadata: Metadata = { title: "Business profile" };

export default async function SellerProfilePage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/profile");
  if (!isSeller(ctx.user)) redirect("/seller/dashboard");

  return (
    <main className="sel-page">
      <SellerPageHeader
        title="Business profile"
        description="Public details buyers see on your provider page. Verification flags cannot be self-set."
      />
      <ProfileForm profile={ctx.profile} />
    </main>
  );
}
