import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBuyerContext } from "@/features/buyer/lib/context";
import { getBuyerQuotes } from "@/features/buyer/lib/queries";
import { respondToQuote } from "@/features/buyer/actions/buyer-actions";

export const metadata: Metadata = { title: "Quotes" };

function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(kobo / 100);
}

export default async function BuyerQuotesPage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/quotes");

  const { data, error } = await getBuyerQuotes(ctx.user.id);

  return (
    <main className="buy-page">
      <BuyerPageHeader
        title="Quotes"
        description="Quotations sellers have sent for your requests."
      />

      {error && <p className="buy-banner-error">{error}</p>}
      {!error && data.length === 0 && (
        <div className="buy-panel">
          <p className="buy-muted">No quotes yet.</p>
          <Link href="/buyer/bookings" className="button button-secondary">
            View bookings
          </Link>
        </div>
      )}

      <ul className="buy-stack">
        {data.map((q) => (
          <li key={q.id} className="buy-stack-item">
            <div>
              <strong>{formatNaira(q.amount_kobo)}</strong>
              <span className={`status-pill status-${q.status}`}>{q.status}</span>
              <p className="muted small">
                {q.booking?.reference_code}
                {q.booking?.title ? ` · ${q.booking.title}` : ""}
                {" · "}
                {new Date(q.created_at).toLocaleDateString()}
              </p>
              {q.description && <p className="prose">{q.description}</p>}
            </div>
            {q.status === "pending" && (
              <div className="booking-actions">
                <form action={respondToQuote}>
                  <input type="hidden" name="quote_id" value={q.id} />
                  <input type="hidden" name="action" value="accept" />
                  <button type="submit" className="button button-primary button-sm">
                    Accept
                  </button>
                </form>
                <form action={respondToQuote}>
                  <input type="hidden" name="quote_id" value={q.id} />
                  <input type="hidden" name="action" value="decline" />
                  <button type="submit" className="button button-secondary button-sm">
                    Decline
                  </button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
