import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Package,
  FileText,
  Store,
  BadgeCheck,
} from "lucide-react";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getSellerDashboardStats } from "@/features/seller/lib/dashboard-stats";
import { PageHeader } from "@/features/seller/components/PageHeader";
import { StatCard } from "@/features/seller/components/StatCard";
import {
  GetStartedChecklist,
  type ChecklistStep,
} from "@/features/seller/components/GetStartedChecklist";
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
  const publishedPct = total > 0 ? Math.round((stats.publishedListings / total) * 100) : 0;
  const limitText =
    stats.listingLimit === -1
      ? "Unlimited published listings"
      : `${stats.publishedListings} of ${stats.listingLimit} published listings used`;

  const checklist: ChecklistStep[] = [
    {
      id: "shop",
      title: "Create your shop",
      description: "Name, category, and profile so buyers can find you.",
      href: "/seller/shop",
      done: Boolean(shop),
    },
    {
      id: "listing",
      title: "Add your first listing",
      description: "A product or service with a photo and clear price.",
      href: "/seller/listings/new",
      done: Boolean(shop && stats.totalListings > 0),
    },
    {
      id: "whatsapp",
      title: "Connect WhatsApp",
      description: "Add the number buyers will message on WhatsApp.",
      href: "/seller/shop",
      done: Boolean(shop?.phone),
    },
    {
      id: "verification",
      title: "Apply for verification",
      description: "Build trust with a reviewed verified badge.",
      href: "/seller/verification",
      done: Boolean(shop && shop.verification_status !== "none"),
    },
  ];

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
              className="interactive inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:bg-[var(--color-soft-green)]"
            >
              View public shop
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          ) : null
        }
      />

      <GetStartedChecklist steps={checklist} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published listings"
          value={stats.publishedListings}
          hint={limitText}
          tone="success"
          icon={Package}
          href="/seller/listings?status=published"
        />
        <StatCard
          label="Drafts"
          value={stats.draftListings}
          hint={total > 0 ? `${publishedPct}% of catalogue is live` : "No listings yet"}
          icon={FileText}
          href="/seller/listings?status=draft"
        />
        <StatCard
          label="Plan"
          value={stats.planLabel}
          hint={
            stats.listingLimit === -1
              ? "Unlimited listings"
              : `Up to ${stats.listingLimit} published`
          }
          icon={Store}
          href="/seller/billing"
        />
        <StatCard
          label="Verification"
          value={verification}
          hint={
            shop?.verification_status === "verified"
              ? "Badge is live on your shop"
              : "Build trust with buyers"
          }
          tone={shop?.verification_status === "verified" ? "success" : "default"}
          icon={BadgeCheck}
          href="/seller/verification"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Next up</h2>
          <ul className="mt-4 space-y-2">
            {nextActions.map((a) => (
              <li key={a.href + a.title}>
                <Link
                  href={a.href}
                  className="group flex items-start justify-between gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3.5 transition hover:border-[#9EBEAA] hover:bg-[var(--color-canvas)]"
                >
                  <span>
                    <span className="block text-sm font-semibold text-[var(--color-ink)]">
                      {a.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--color-ink-soft)]">
                      {a.body}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-[var(--color-ink-soft)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
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
            <dl className="mt-4 grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-ink-soft)]">Shop name</dt>
                <dd className="mt-1 font-medium text-[var(--color-ink)]">{shop.name}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-ink-soft)]">Visibility</dt>
                <dd className="mt-1">
                  <Badge variant={visibility.variant}>{visibility.label}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-ink-soft)]">Public link</dt>
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
                    <span className="text-[var(--color-ink-soft)]">
                      /shop/{shop.slug} (not live yet)
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-ink-soft)]">Verification</dt>
                <dd className="mt-1 font-medium text-[var(--color-ink)]">{verification}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
              You haven&apos;t created a shop yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
