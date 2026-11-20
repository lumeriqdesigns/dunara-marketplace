import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getSellerDashboardStats } from "@/features/seller/lib/dashboard-stats";
import { PageHeader } from "@/features/seller/components/PageHeader";
import { StatCard } from "@/features/seller/components/StatCard";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Seller dashboard",
};

export default async function SellerHomePage() {
  const user = await requireUser("/seller");
  const shop = await getOwnShop(user.id);
  const stats = await getSellerDashboardStats(shop);

  const fullName = (user.user_metadata?.full_name as string | undefined)?.trim();
  const firstName = fullName ? fullName.split(/\s+/)[0] : "";

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
      body: "Complete the required profile fields and publish to appear in search.",
    });
  }
  if (shop && stats.totalListings === 0) {
    nextActions.push({
      href: "/seller/listings/new",
      title: "Add your first listing",
      body: "Showcase a product or service with a photo and a clear price.",
    });
  } else if (shop && stats.draftListings > 0 && stats.publishedListings === 0) {
    nextActions.push({
      href: "/seller/listings",
      title: "Publish a listing",
      body: "You have drafts ready. Publish one once your shop is live.",
    });
  }
  if (nextActions.length === 0) {
    nextActions.push({
      href: "/seller/listings/new",
      title: "Add another listing",
      body: "Keep your catalogue fresh so buyers find the right offer.",
    });
    nextActions.push({
      href: "/seller/ai",
      title: "Draft a WhatsApp reply",
      body: "Use the AI assistant to reply faster without inventing facts.",
    });
  }

  const visibility = !shop
    ? { label: "No shop", variant: "outline" as const }
    : shop.is_suspended
      ? { label: "Suspended", variant: "destructive" as const }
      : shop.is_published
        ? { label: "Published", variant: "success" as const }
        : { label: "Draft", variant: "warning" as const };

  const verification = !shop
    ? "—"
    : shop.verification_status === "none"
      ? "Not applied"
      : shop.verification_status.charAt(0).toUpperCase() + shop.verification_status.slice(1);

  const total = stats.totalListings;
  const publishedPct = total > 0 ? (stats.publishedListings / total) * 100 : 0;
  const limitText =
    stats.listingLimit === -1
      ? "Unlimited published listings"
      : `${stats.publishedListings} of ${stats.listingLimit} published listings used`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Manage your shop and listings. Buyers contact you on WhatsApp."
        actions={
          shop?.is_published ? (
            <Link
              href={`/shop/${shop.slug}`}
              target="_blank"
              rel="noreferrer"
              className="interactive inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] hover:border-[#9EBEAA] hover:bg-[var(--color-soft-green)]"
            >
              View public shop
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Plan"
          value={stats.planLabel}
          hint={stats.listingLimit === -1 ? "Unlimited published listings" : `Up to ${stats.listingLimit} published listings`}
          href="/seller/billing"
        />
        <StatCard label="Published" value={stats.publishedListings} tone="success" hint="Visible to buyers" href="/seller/listings?status=published" />
        <StatCard label="Drafts" value={stats.draftListings} hint="Not visible yet" href="/seller/listings?status=draft" />
        <StatCard label="Total listings" value={stats.totalListings} href="/seller/listings" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] lg:col-span-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-ink)]">Your listings</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{limitText}</p>
            </div>
            <Link
              href="/seller/listings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              Manage
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          {total === 0 ? (
            <p className="mt-6 rounded-xl bg-[var(--color-surface-warm)] px-4 py-6 text-center text-sm text-[var(--color-muted)]">
              No listings yet. Your published and draft listings will show here.
            </p>
          ) : (
            <>
              <div
                className="mt-6 flex h-3 overflow-hidden rounded-full bg-[#E9EBE4]"
                role="img"
                aria-label={`${stats.publishedListings} published and ${stats.draftListings} draft listings`}
              >
                <div
                  className="h-full bg-[var(--color-primary)] motion-move transition-[width]"
                  style={{ width: `${publishedPct}%` }}
                />
              </div>
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-[var(--color-primary)]" />
                  <dt className="text-[var(--color-muted)]">Published</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-ink)]">{stats.publishedListings}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-[#E9EBE4] ring-1 ring-[var(--color-border)]" />
                  <dt className="text-[var(--color-muted)]">Drafts</dt>
                  <dd className="font-semibold tabular-nums text-[var(--color-ink)]">{stats.draftListings}</dd>
                </div>
              </dl>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] lg:col-span-5">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Next steps</h2>
          <ul className="mt-4 space-y-3">
            {nextActions.map((a) => (
              <li key={a.href + a.title}>
                <Link
                  href={a.href}
                  className="interactive group flex items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3 hover:border-[var(--color-primary)] hover:bg-[var(--color-soft-green)]/40"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--color-ink)]">{a.title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--color-muted)]">{a.body}</span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-[var(--color-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Shop status</h2>
          <Link
            href="/seller/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            {shop ? "Edit shop" : "Create shop"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {shop ? (
          <dl className="mt-4 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-[var(--color-muted)]">Shop name</dt>
              <dd className="mt-1 font-medium text-[var(--color-ink)]">{shop.name}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Visibility</dt>
              <dd className="mt-1">
                <Badge variant={visibility.variant}>{visibility.label}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Public link</dt>
              <dd className="mt-1 break-all">
                {shop.is_published ? (
                  <a
                    href={`/shop/${shop.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="interactive font-medium text-[var(--color-primary)] hover:underline"
                  >
                    /shop/{shop.slug}
                  </a>
                ) : (
                  <span className="text-[var(--color-muted)]">/shop/{shop.slug} (not live yet)</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted)]">Verification</dt>
              <dd className="mt-1 font-medium text-[var(--color-ink)]">{verification}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-muted)]">You haven’t created a shop yet.</p>
        )}
      </section>
    </div>
  );
}
