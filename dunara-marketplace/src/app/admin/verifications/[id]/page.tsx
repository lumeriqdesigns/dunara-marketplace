import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminVerificationDetail } from "@/features/verification/actions";
import { AdminReviewForm } from "@/features/verification/components/AdminReviewForm";
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
    <div className="space-y-8">
      <div>
        <p className="text-xs text-[var(--color-muted)]">
          <Link href="/admin/verifications" className="hover:underline">
            Verifications
          </Link>{" "}
          / {id.slice(0, 8)}…
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-ink)]">
          Review application
        </h1>
        <div className="mt-2 flex flex-wrap gap-1">
          {verificationBadge(
            request.status === "approved" ? "verified" : request.status
          )}
          {request.priority ? (
            <span className="text-xs font-medium text-[var(--color-primary)]">
              Apex priority snapshot
            </span>
          ) : null}
        </div>
      </div>

      <section className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Shop</h2>
          <p className="mt-1 font-medium text-[var(--color-ink)]">{shop.name}</p>
          <Link
            href={`/admin/shops/${shop.id}`}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Admin shop detail
          </Link>
          <div className="mt-2 flex flex-wrap gap-1">
            {publishedBadge(shop.is_published)}
            {suspendedBadge(shop.is_suspended)}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Applicant</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
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
            <p className="mt-2 text-sm text-[var(--color-ink)]">
              Seller note: {request.seller_note}
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--color-ink)]">Documents</h2>
        <p className="text-xs text-[var(--color-muted)]">
          Signed links expire in about two minutes. Do not share them. Paths are never shown on
          public pages.
        </p>
        {documents.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No documents available (missing files or signing failed).
          </p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc, i) => (
              <li
                key={doc.path}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3"
              >
                <span className="text-sm text-[var(--color-ink)]">Document {i + 1}</span>
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Open secure preview
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-ink)]">Decision</h2>
        <AdminReviewForm requestId={request.id} status={request.status} />
      </section>
    </div>
  );
}
