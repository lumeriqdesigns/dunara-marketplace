import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getListingBySlug } from "@/features/marketplace/lib/queries";
import { getSessionUser } from "@/lib/auth/session";
import { BookingRequestForm } from "@/features/buyer/components/booking-request-form";
import { brand } from "@/config/brand";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getListingBySlug(slug);
  return {
    title: data ? `Request · ${data.title}` : "Request service"
  };
}

export default async function ServiceRequestPage({ params }: Props) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=/services/${encodeURIComponent(slug)}/request`);
  }

  const { data: listing, error } = await getListingBySlug(slug);
  if (error) {
    return (
      <main className="marketplace-page">
        <div className="container">
          <p className="form-error">{error}</p>
        </div>
      </main>
    );
  }
  if (!listing || !listing.seller) notFound();

  return (
    <main className="marketplace-page">
      <div className="container prose-page">
        <p className="eyebrow">
          <Link href={`/services/${listing.slug}`}>{listing.title}</Link>
        </p>
        <h1>Request this service</h1>
        <p className="marketplace-lead">
          Send a request on {brand.shortName}. The provider can accept, decline, or
          send a quote.
        </p>
        <BookingRequestForm
          sellerId={listing.seller.id}
          listingId={listing.id}
          defaultTitle={listing.title}
          providerName={listing.seller.business_name}
        />
      </div>
    </main>
  );
}
