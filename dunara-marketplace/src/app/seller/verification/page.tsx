import { asFormAction } from "@/lib/forms/as-form-action";
import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { isSeller } from "@/lib/permissions";
import {
  listSellerVerifications,
  listVerificationDocuments,
} from "@/features/verification/lib/queries";
import {
  submitVerificationApplication,
  uploadVerificationDocument,
  resubmitVerification,
} from "@/features/verification/actions/verification-actions";
import { LEVEL_LABELS, STATUS_LABELS } from "@/features/verification/lib/types";
import { VerificationBadge } from "@/features/marketplace/components/verification-badge";
import type { VerificationDocument } from "@/features/verification/lib/types";

export const metadata: Metadata = { title: "Verification — Dúnarà Marketplace" };

export default async function SellerVerificationPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/verification");
  if (!isSeller(ctx.user) || !ctx.profile) redirect("/seller/dashboard");

  const { data: applications, error } = await listSellerVerifications(ctx.profile.id);

  const docsByApp = new Map<string, VerificationDocument[]>();
  for (const app of applications) {
    const { data: docs } = await listVerificationDocuments(app.id);
    docsByApp.set(app.id, docs);
  }

  return (
    <main className="sel-page">
      <SellerPageHeader
        title="Verification"
        description="Submit documents for review. Status is set by verification officers only."
      />
      <p className="muted small">
        Dúnarà verification means an officer reviewed the documents you submitted.
        It does not guarantee the quality of services or full legal identity.
        You cannot approve your own application.
      </p>

      {error && <p className="sel-banner-error">{error}</p>}

      <section className="dashboard-panel mt-4">
        <h2>Submit application</h2>
        <form action={asFormAction(submitVerificationApplication)} className="seller-form space-y-3">
          <label className="block">
            Level requested
            <select
              name="level"
              defaultValue="basic"
              className="mt-1 block w-full rounded-md border px-3 py-2"
            >
              <option value="basic">Basic account</option>
              <option value="identity">Identity</option>
              <option value="business">Business</option>
              <option value="professional">Professional / qualification</option>
            </select>
          </label>
          <button type="submit" className="button button-primary">
            Submit application
          </button>
        </form>
      </section>

      <section className="dashboard-panel mt-6">
        <h2>Application history</h2>
        {applications.length === 0 && <p className="sel-muted">No applications yet.</p>}
        <ul className="space-y-4">
          {applications.map((app) => {
            const docs = docsByApp.get(app.id) ?? [];
            return (
              <li key={app.id} className="rounded-md border p-4">
                <p>
                  <strong>{LEVEL_LABELS[app.level] ?? app.level}</strong>
                  {" · "}
                  {STATUS_LABELS[app.status] ?? app.status}
                </p>
                {app.submitted_at && (
                  <p className="muted small">
                    Submitted {new Date(app.submitted_at).toLocaleString()}
                  </p>
                )}
                {app.status === "additional_info_required" && (
                  <div className="mt-2 rounded bg-amber-50 p-3 text-sm">
                    <p className="font-medium">More information required</p>
                    <p>{app.additional_info_request}</p>
                    <p className="muted small mt-1">
                      Upload any requested documents below, then resubmit.
                    </p>
                    <form action={asFormAction(resubmitVerification)} className="mt-2">
                      <input type="hidden" name="verification_id" value={app.id} />
                      <button type="submit" className="button button-primary button-sm">
                        Resubmit for review
                      </button>
                    </form>
                  </div>
                )}
                {app.status === "rejected" && app.rejection_reason && (
                  <p className="mt-2 text-sm text-red-700">
                    Reason: {app.rejection_reason}
                  </p>
                )}
                {app.status === "approved" && (
                  <p className="mt-2 text-sm text-green-700">
                    Approved. Your public profile shows a verification badge for this level.
                  </p>
                )}

                {["draft", "submitted", "additional_info_required"].includes(app.status) && (
                  <form
                    action={asFormAction(uploadVerificationDocument)}
                    className="mt-3 space-y-2 border-t pt-3"
                  >
                    <input type="hidden" name="verification_id" value={app.id} />
                    <label className="block text-sm">
                      Document type
                      <input
                        name="document_type"
                        defaultValue="identity_document"
                        className="mt-1 block w-full rounded-md border px-2 py-1"
                      />
                    </label>
                    <label className="block text-sm">
                      File (PDF or image, max 10 MB)
                      <input
                        type="file"
                        name="file"
                        accept=".pdf,image/jpeg,image/png,image/webp"
                        required
                        className="mt-1 block w-full text-sm"
                      />
                    </label>
                    <button type="submit" className="button button-secondary button-sm">
                      Upload document
                    </button>
                  </form>
                )}

                {docs.length > 0 && (
                  <ul className="mt-2 text-sm muted">
                    {docs.map((d) => (
                      <li key={d.id}>
                        {d.document_type}: {d.file_name} (
                        {Math.round(d.file_size_bytes / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
