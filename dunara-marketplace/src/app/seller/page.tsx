import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getSellerDashboardStats } from "@/features/seller/lib/dashboard-stats";
import { PageHeader } from "@/features/seller/components/PageHeader";
import { StatCard } from "@/features/seller/components/StatCard";

export const metadata: Metadata = {
  title: "Seller dashboard",
};

export default async function SellerHomePage() {
  const user = await requireUser("/seller");
  const shop = await getOwnShop(user.id);
  const stats = await getSellerDashboardStats(shop);
  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email ||
    "there";

  const nextActions: { href: string; title: string; body: string }[] = [];
  if (!shop) {
    nextActions.push({
      href: "/seller/shop",
      title: "Create your shop",
      body: "Add a name, category, and WhatsApp number so buyers can find you.",
    });
  } else if (!shop.is_published) {
    nextActions.push({
      href: "/seller/shop",
      title: "Publish your shop",
      body: "Complete required profile fields and publish to appear in search.",
    });
  }
  if (shop && stats.totalListings === 0) {
    nextActions.push({
      href: "/seller/listings/new",
      title: "Add your first listing",
      body: "Showcase a product or service with a photo and clear price.",
    });
  } else if (shop && stats.draftListings > 0 && stats.publishedListings === 0) {
    nextActions.push({
      href: "/seller/listings",
      title: "Publish a listing",
      body: "You have drafts ready — publish one when the shop is live.",
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${name}`}
        description="Manage your shop and listings. Buyers contact you on WhatsApp."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total listings" value={stats.totalListings} />
        <StatCard label="Published" value={stats.publishedListings} />
        <StatCard label="Drafts" value={stats.draftListings} />
        <StatCard
          label="Plan"
          value={stats.planLabel}
          hint={
            stats.listingLimit === -1
              ? "Unlimited published listings"
              : `Up to ${stats.listingLimit} published · ${stats.planStatus}`
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Shop status</h2>
          {shop ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-muted)]">Name</dt>
                <dd className="font-medium text-[var(--color-ink)]">{shop.name}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Visibility</dt>
                <dd className="font-medium text-[var(--color-ink)]">
                  {shop.is_suspended
                    ? "Suspended"
                    : shop.is_published
                      ? "Published"
                      : "Draft"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Public URL</dt>
                <dd>
                  {shop.is_published ? (
                    <a
                      href={`/shop/${shop.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[var(--color-primary)] hover:underline"
                    >
                      /shop/{shop.slug}
                    </a>
                  ) : (
                    <span className="text-[var(--color-muted)]">/shop/{shop.slug}</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted)]">Verification</dt>
                <dd className="capitalize text-[var(--color-ink)]">
                  {shop.verification_status === "none"
                    ? "Not applied"
                    : shop.verification_status}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              You have not created a shop yet.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/seller/shop" className="font-medium text-[var(--color-primary)]">
              {shop ? "Edit shop" : "Create shop"} →
            </Link>
            <Link href="/seller/listings" className="font-medium text-[var(--color-muted)]">
              Manage listings →
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Next steps</h2>
          {nextActions.length > 0 ? (
            <ul className="mt-4 space-y-4">
              {nextActions.map((a) => (
                <li key={a.href}>
                  <Link
                    href={a.href}
                    className="block rounded-md border border-[var(--color-border)] p-3 transition hover:border-[var(--color-primary)]"
                  >
                    <p className="text-sm font-medium text-[var(--color-ink)]">{a.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{a.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              You are set up. Keep listings fresh and respond quickly on WhatsApp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
