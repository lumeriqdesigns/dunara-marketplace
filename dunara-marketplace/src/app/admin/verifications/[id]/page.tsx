import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminVerificationDetail } from "@/features/verification/actions";
import { AdminReviewForm } from "@/features/verification/components/AdminReviewForm";
import { DocumentPreview } from "@/features/verification/components/DocumentPreview";
import {
  verificationBadge,
  suspendedBadge,
  publishedBadge,
} from "@/features/admin/components/StatusBadge";

export const metadata = { title: "Verification review · Admin · Dunara" };

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminVerificationDetail(id);
  if (!result.ok || !result.data) {
    notFound();
  }

  const { request, shop, owner, documents } = result.data;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[var(--color-muted)]">
          <Link href="/admin/verifications" className="hover:underline">
            Verifications
          </Link>{" "}
          / {id.slice(0, 8)}…
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          Review application
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {verificationBadge(
            request.status === "approved" ? "verified" : request.status
          )}
          {request.priority ? (
            <span className="rounded-full bg-[var(--color-soft-green)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
              Apex priority
            </span>
          ) : null}
        </div>
      </div>

      {/* Two-column: documents left, decision + context right */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:items-start">
        {/* Left — submitted documents */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Submitted documents</h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Signed links expire in about two minutes. Do not share them. Paths are never shown on
              public pages.
            </p>
          </div>
          <DocumentPreview documents={documents} />
        </section>

        {/* Right — context + decision */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Shop & applicant</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                  Shop
                </p>
                <p className="mt-0.5 font-medium text-[var(--color-ink)]">{shop.name}</p>
                <Link
                  href={`/admin/shops/${shop.id}`}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Open admin shop detail
                </Link>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {publishedBadge(shop.is_published)}
                  {suspendedBadge(shop.is_suspended)}
                </div>
              </div>
              <div className="border-t border-[var(--color-border)] pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                  Applicant
                </p>
                <p className="mt-0.5 text-sm text-[var(--color-ink)]">
                  {owner?.full_name ?? "—"}
                </p>
                <p className="text-sm text-[var(--color-muted)]">{owner?.email ?? "—"}</p>
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  Submitted {new Date(request.created_at).toLocaleString("en-NG")}
                  {request.plan_slug_at_submission
                    ? ` · Plan at submit: ${request.plan_slug_at_submission}`
                    : ""}
                </p>
                {request.seller_note ? (
                  <p className="mt-3 rounded-xl bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-ink)]">
                    <span className="font-medium">Seller note: </span>
                    {request.seller_note}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-[var(--color-ink)]">Decision</h2>
            <AdminReviewForm requestId={request.id} status={request.status} />
          </section>
        </div>
      </div>
    </div>
  );
}
