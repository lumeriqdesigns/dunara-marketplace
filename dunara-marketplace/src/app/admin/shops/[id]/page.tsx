import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdminShopDetail,
  setShopSuspension,
  setListingPublished,
} from "@/features/admin/actions";
import { ConfirmReasonForm } from "@/features/admin/components/ConfirmReasonForm";
import {
  publishedBadge,
  suspendedBadge,
  verificationBadge,
  subscriptionBadge,
} from "@/features/admin/components/StatusBadge";

export const metadata = { title: "Shop detail · Admin · Dunara" };

export default async function AdminShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminShopDetail(id);
  if (!result.ok || !result.data) {
    notFound();
  }

  const { shop, owner, subscription, listings, verifications } = result.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--color-muted)]">
            <Link href="/admin/shops" className="hover:underline">
              Shops
            </Link>{" "}
            / {shop.slug}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">
            {shop.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1">
            {publishedBadge(shop.is_published)}
            {suspendedBadge(shop.is_suspended)}
            {verificationBadge(shop.verification_status)}
          </div>
        </div>
        <div className="min-w-[240px]">
          {shop.is_suspended ? (
            <ConfirmReasonForm
              title="Restore this shop?"
              description="The shop will become publicly visible again if published."
              confirmLabel="Restore shop"
              onConfirm={async (reason) => setShopSuspension(shop.id, false, reason)}
            />
          ) : (
            <ConfirmReasonForm
              title="Suspend this shop?"
              description="Public pages and listings for this shop will be hidden. Content is kept."
              confirmLabel="Suspend shop"
              destructive
              onConfirm={async (reason) => setShopSuspension(shop.id, true, reason)}
            />
          )}
        </div>
      </div>

      <section className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Owner</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {owner?.full_name ?? "—"}
          </p>
          <p className="text-sm text-[var(--color-muted)]">{owner?.email ?? "—"}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Location</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {[shop.city, shop.state].filter(Boolean).join(", ") || "—"}
          </p>
          {shop.suspension_reason ? (
            <p className="mt-2 text-sm text-[var(--color-error)]">
              Suspension reason: {shop.suspension_reason}
            </p>
          ) : null}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Subscription</h2>
          {subscription ? (
            <div className="mt-1 space-y-1">
              {subscriptionBadge(subscription.status)}
              <p className="text-sm text-[var(--color-muted)]">
                {(subscription as { plans?: { name?: string } | null }).plans?.name ??
                  "Plan"}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm text-[var(--color-muted)]">No subscription row</p>
          )}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Public page</h2>
          <Link
            href={`/shop/${shop.slug}`}
            className="mt-1 inline-block text-sm text-[var(--color-primary)] hover:underline"
          >
            /shop/{shop.slug}
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--color-ink)]">Listings</h2>
        {listings.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No listings.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-white">
            {listings.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{l.title}</p>
                  <div className="mt-1 flex gap-1">
                    {publishedBadge(l.is_published)}
                    <span className="text-xs text-[var(--color-muted)]">
                      {l.listing_type}
                    </span>
                  </div>
                </div>
                {l.is_published ? (
                  <ConfirmReasonForm
                    title="Unpublish listing?"
                    description="Listing remains stored; only visibility changes."
                    confirmLabel="Unpublish"
                    destructive
                    onConfirm={async (reason) =>
                      setListingPublished(l.id, false, reason)
                    }
                  />
                ) : (
                  <ConfirmReasonForm
                    title="Publish listing?"
                    confirmLabel="Publish"
                    onConfirm={async (reason) =>
                      setListingPublished(l.id, true, reason)
                    }
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--color-ink)]">
          Verification history
        </h2>
        {verifications.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No verification requests.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-white">
            {verifications.map((v) => (
              <li key={v.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {verificationBadge(v.status)}
                  {v.priority ? (
                    <span className="text-xs text-[var(--color-primary)]">Priority</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Submitted {new Date(v.created_at).toLocaleString("en-NG")}
                  {v.rejection_reason ? ` · ${v.rejection_reason}` : ""}
                </p>
                <Link
                  href={`/admin/verifications/${v.id}`}
                  className="mt-1 inline-block text-xs text-[var(--color-primary)] hover:underline"
                >
                  Open review (Module 11)
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
