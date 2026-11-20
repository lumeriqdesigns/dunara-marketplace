import Link from "next/link";
import { getSellerVerificationStatus } from "@/features/verification/actions";
import { VerificationSubmitForm } from "@/features/verification/components/VerificationSubmitForm";
import { EmptyState } from "@/components/ui/empty-state";
import { verificationBadge } from "@/features/admin/components/StatusBadge";

export const metadata = {
  title: "Verification · Seller · Dunara",
  description: "Apply for a Dunara verified badge",
};

export default async function SellerVerificationPage() {
  const result = await getSellerVerificationStatus();

  if (!result.ok || !result.data) {
    if (result.message?.includes("Create a shop")) {
      return (
        <div className="space-y-4">
          <EmptyState
            title="Create a shop first"
            description="Verification is tied to your public shop profile."
          />
          <div className="flex justify-center">
            <Link
              href="/seller/shop"
              className="inline-flex min-h-11 items-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white"
            >
              Create shop
            </Link>
          </div>
        </div>
      );
    }
    return (
      <EmptyState
        title="Could not load verification"
        description={result.message ?? "Try again shortly."}
      />
    );
  }

  const d = result.data;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Verification</h1>
        <p className="text-sm text-[var(--color-muted)]">
          A verified badge means Dunara completed a manual document review for this shop. It does
          not guarantee product quality, delivery, or payment safety.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {verificationBadge(d.shopStatus === "verified" ? "verified" : d.shopStatus === "pending" ? "pending" : d.shopStatus === "rejected" ? "rejected" : "none")}
          <span className="text-xs text-[var(--color-muted)]">
            Current plan: {d.planName}
          </span>
        </div>
      </header>

      {!d.eligible ? (
        <section className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">
            Upgrade to apply
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Verification is available on <strong>Pulse</strong> and <strong>Apex</strong>. Open plan
            shops cannot submit documents.
          </p>
          <Link
            href="/seller/billing"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white"
          >
            View plans
          </Link>
        </section>
      ) : null}

      {d.shopStatus === "verified" ? (
        <section className="rounded-lg border border-[var(--color-soft-green)] bg-[var(--color-soft-green)]/40 p-5">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">You are verified</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Your public shop page shows the verified badge
            {d.verifiedAt
              ? ` (since ${new Date(d.verifiedAt).toLocaleDateString("en-NG")})`
              : ""}
            . An earned badge stays if you later change plans.
          </p>
        </section>
      ) : null}

      {d.latest?.status === "pending" ? (
        <section className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">
            Awaiting review
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Submitted {new Date(d.latest.created_at).toLocaleString("en-NG")}
            {d.latest.priority ? " · Apex priority queue" : ""}. We do not promise a fixed review
            time. You cannot submit another request while this one is pending.
          </p>
        </section>
      ) : null}

      {d.latest?.status === "rejected" && d.shopStatus !== "verified" ? (
        <section className="rounded-lg border border-red-100 bg-red-50/50 p-5">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">
            Application rejected
          </h2>
          <p className="mt-2 text-sm text-[var(--color-error)]">
            {d.latest.rejection_reason || d.verificationNote || "Please correct and resubmit."}
          </p>
          {d.canSubmit ? (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              You can upload corrected documents below.
            </p>
          ) : null}
        </section>
      ) : null}

      {d.canSubmit ? (
        <section className="space-y-3 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">
            Submit documents
          </h2>
          <p className="text-sm text-[var(--color-muted)]">{d.evidenceHelp}</p>
          <VerificationSubmitForm />
        </section>
      ) : null}

      {d.history.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">History</h2>
          <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-white">
            {d.history.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  {verificationBadge(h.status === "approved" ? "verified" : h.status)}
                  {h.priority ? (
                    <span className="text-xs text-[var(--color-primary)]">Priority</span>
                  ) : null}
                </div>
                <span className="text-xs text-[var(--color-muted)]">
                  {new Date(h.created_at).toLocaleDateString("en-NG")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
