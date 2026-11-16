import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSellerContext } from "@/features/seller/lib/context";
import { isSeller } from "@/lib/permissions";

export const metadata: Metadata = { title: "Enquiries" };

export default async function SellerEnquiriesPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/enquiries");
  if (!isSeller(ctx.user)) redirect("/seller/dashboard");

  return (
    <main className="sel-page">
      <SellerPageHeader
        title="Enquiries"
        description="Messages from buyers before a booking is confirmed."
      />
      <Link href="/seller/messages" className="button button-primary">
        Open messages
      </Link>
      <p className="muted small" style={{ marginTop: 16 }}>
        Booking-linked enquiries also show under{" "}
        <Link href="/seller/bookings">Bookings</Link>.
      </p>
    </main>
  );
}
