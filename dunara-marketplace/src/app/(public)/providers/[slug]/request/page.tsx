import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProviderBySlug } from "@/features/marketplace/lib/queries";
import { getSessionUser } from "@/lib/auth/session";
import { BookingRequestForm } from "@/features/buyer/components/booking-request-form";
import { brand } from "@/config/brand";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getProviderBySlug(slug);
  return {
    title: data ? `Request · ${data.business_name}` : "Request provider"
  };
}

export default async function ProviderRequestPage({ params }: Props) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=/providers/${encodeURIComponent(slug)}/request`);
  }

  const { data: provider, error } = await getProviderBySlug(slug);
  if (error) {
    return (
      <main className="marketplace-page">
        <div className="container">
          <p className="form-error">{error}</p>
        </div>
      </main>
    );
  }
  if (!provider) notFound();

  return (
    <main className="marketplace-page">
      <div className="container prose-page">
        <p className="eyebrow">
          <Link href={`/providers/${provider.slug}`}>{provider.business_name}</Link>
        </p>
        <h1>Send a request</h1>
        <p className="marketplace-lead">
          Tell {provider.business_name} what you need. Payment is arranged directly
          after you agree — {brand.shortName} does not process payments in version 1.
        </p>
        <BookingRequestForm
          sellerId={provider.id}
          providerName={provider.business_name}
        />
      </div>
    </main>
  );
}
