import { asFormAction } from "@/lib/forms/as-form-action";
import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection } from "@/features/admin/lib/access";
import { getReviewsForModeration } from "@/features/reviews/lib/queries";
import { moderateReview } from "@/features/reviews/actions/review-actions";

export const metadata: Metadata = { title: "Review moderation" };

export default async function AdminReviewsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/reviews");
  if (!canAccessSection(user, "reviews")) {
    redirect("/admin/dashboard");
  }

  const { data: reviews, error } = await getReviewsForModeration(50);

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Review moderation"
        description="Hide or flag inappropriate reviews."
      />

      {error && <p className="adm-banner-error">{error}</p>}
      {!error && reviews.length === 0 && (
        <p className="adm-muted">No reviews to moderate.</p>
      )}

      <ul className="adm-stack">
        {reviews.map((r) => (
          <li key={r.id} className="adm-stack-item">
            <div style={{ flex: 1 }}>
              <strong>
                {r.rating}/5{r.title ? ` · ${r.title}` : ""}
              </strong>
              <p className="muted small">
                {r.buyer?.display_name ?? "Buyer"} ·{" "}
                {new Date(r.created_at).toLocaleDateString()} ·{" "}
                {r.is_public ? "Public" : "Hidden"}
                {r.is_moderated ? " · Moderated" : ""}
              </p>
              {r.body && <p className="prose">{r.body}</p>}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <form action={asFormAction(moderateReview)}>
                <input type="hidden" name="review_id" value={r.id} />
                <input type="hidden" name="is_public" value="false" />
                <input type="hidden" name="is_moderated" value="true" />
                <input
                  type="hidden"
                  name="notes"
                  value="Hidden by moderator"
                />
                <button type="submit" className="button button-secondary button-sm">
                  Hide
                </button>
              </form>
              <form action={asFormAction(moderateReview)}>
                <input type="hidden" name="review_id" value={r.id} />
                <input type="hidden" name="is_public" value="true" />
                <input type="hidden" name="is_moderated" value="false" />
                <input type="hidden" name="notes" value="Restored by moderator" />
                <button type="submit" className="button button-primary button-sm">
                  Restore
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
