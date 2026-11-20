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

/** Simple deterministic bars for last 7 days when real series is unavailable. */
function activityBars(seed: number) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const counts = days.map((_, i) => ((seed + i * 3) % 7) + (i % 3));
  const max = Math.max(...counts, 1);
  return { days, counts, max };
}

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

  const bars = activityBars(stats.totalListings + stats.publishedListings);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${name}`}
        description="Manage your shop and listings. Buyers contact you on WhatsApp."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total listings" value={stats.totalListings} />
        <StatCard label="Published" value={stats.publishedListings} tone="success" />
        <StatCard label="Drafts" value={stats.draftListings} />
        <StatCard
          label="Plan"
          value={stats.planLabel}
          glass
          hint={
            stats.listingLimit === -1
              ? "Unlimited published listings"
              : `Up to ${stats.listingLimit} published · ${stats.planStatus}`
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Activity</h2>
            <span className="text-xs text-[var(--color-muted)]">Listings snapshot</span>
          </div>
          <div className="flex h-40 items-end gap-2">
            {bars.days.map((d, i) => (
              <div key={`${d}-${i}`} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[2.5rem] rounded-t-md bg-[var(--color-primary)]/85"
                  style={{
                    height: `${Math.max(12, (bars.counts[i] / bars.max) * 100)}%`,
                  }}
                  title={`${bars.counts[i]}`}
                />
                <span className="text-[10px] text-[var(--color-muted)]">{d}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            Visual placeholder — wire to real daily stats when available.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm lg:col-span-5">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Next steps</h2>
          <ul className="space-y-3">
            {nextActions.map((a) => (
              <li key={a.href + a.title}>
                <Link
                  href={a.href}
                  className="block rounded-xl border border-[var(--color-border)] px-3 py-3 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-soft-green)]/40"
                >
                  <p className="text-sm font-medium text-[var(--color-ink)]">{a.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">{a.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm lg:col-span-2">
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
            <Link href="/seller/listings" className="font-medium text-[var(--color-primary)]">
              Manage listings →
            </Link>
            <Link href="/seller/billing" className="font-medium text-[var(--color-primary)]">
              Billing →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Shortcuts</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/seller/ai" className="text-[var(--color-primary)] hover:underline">
                AI assistant
              </Link>
            </li>
            <li>
              <Link href="/seller/verification" className="text-[var(--color-primary)] hover:underline">
                Verification
              </Link>
            </li>
            <li>
              <Link href="/seller/settings" className="text-[var(--color-primary)] hover:underline">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
