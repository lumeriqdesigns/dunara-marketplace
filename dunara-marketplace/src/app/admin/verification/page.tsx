import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/permissions";
import { listOfficerQueue, listVerificationDocuments } from "@/features/verification/lib/queries";
import { officerDecideVerification } from "@/features/verification/actions/verification-actions";
import { LEVEL_LABELS, STATUS_LABELS } from "@/features/verification/lib/types";
import type { VerificationDocument } from "@/features/verification/lib/types";

export const metadata: Metadata = {
  title: "Verification queue — Dúnarà Marketplace",
};

export default async function AdminVerificationQueuePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/verification");
  if (!hasRole(user, "verification_officer") && !hasRole(user, "super_admin")) {
    redirect("/admin/dashboard");
  }

  const { data: queue, error } = await listOfficerQueue();
  const docsByApp = new Map<string, VerificationDocument[]>();
  for (const app of queue) {
    const { data: docs } = await listVerificationDocuments(app.id);
    docsByApp.set(app.id, docs);
  }

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Verification queue"
        description="Review seller verification applications."
      />
      <p className="muted small">
        Badges indicate completed checks only — not a guarantee of service quality.
      </p>

      {error && <p className="adm-banner-error">{error}</p>}
      {queue.length === 0 && <p className="adm-muted">No applications awaiting review.</p>}

      <ul className="space-y-6 mt-4">
        {queue.map((app) => {
          const seller = app.seller_profiles as
            | { business_name: string; slug: string }
            | null
            | undefined;
          const docs = docsByApp.get(app.id) ?? [];
          return (
            <li key={app.id} className="rounded-md border p-4">
              <p>
                <strong>{seller?.business_name ?? "Seller"}</strong>
                {" · "}
                {LEVEL_LABELS[app.level] ?? app.level}
                {" · "}
                {STATUS_LABELS[app.status] ?? app.status}
              </p>
              {app.submitted_at && (
                <p className="muted small">
                  Submitted {new Date(app.submitted_at).toLocaleString()}
                </p>
              )}
              {docs.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm">
                  {docs.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center gap-2">
                      <span>
                        {d.document_type}: {d.file_name}
                      </span>
                      <a
                        href={`/api/verification/document?id=${d.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-secondary button-sm"
                      >
                        View (signed, 5 min)
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted small mt-2">No documents uploaded yet.</p>
              )}

              <form action={officerDecideVerification} className="mt-4 grid gap-2 max-w-md">
                <input type="hidden" name="verification_id" value={app.id} />
                <label className="text-sm">
                  Notes
                  <textarea name="notes" rows={2} className="mt-1 block w-full rounded-md border px-2 py-1" />
                </label>
                <label className="text-sm">
                  Rejection reason (required if rejecting)
                  <input name="rejection_reason" className="mt-1 block w-full rounded-md border px-2 py-1" />
                </label>
                <label className="text-sm">
                  Additional info request (required if requesting info)
                  <textarea
                    name="additional_info_request"
                    rows={2}
                    className="mt-1 block w-full rounded-md border px-2 py-1"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    name="decision"
                    value="under_review"
                    className="button button-secondary button-sm"
                  >
                    Mark under review
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="request_info"
                    className="button button-secondary button-sm"
                  >
                    Request info
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="approve"
                    className="button button-primary button-sm"
                  >
                    Approve
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="reject"
                    className="button button-secondary button-sm"
                  >
                    Reject
                  </button>
                </div>
              </form>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
