import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSellerContext } from "@/features/seller/lib/context";
import { getSellerListings } from "@/features/seller/lib/queries";
import { isSeller } from "@/lib/permissions";
import { archiveListing } from "@/features/seller/actions/seller-actions";

export const metadata: Metadata = { title: "Listings" };

export default async function SellerListingsPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/listings");
  if (!isSeller(ctx.user)) redirect("/seller/dashboard");
  if (!ctx.profile) {
    return (
      <main className="sel-page">
        <h1>Listings</h1>
        <p>Create a business profile before adding listings.</p>
        <Link href="/seller/profile" className="button button-primary">
          Create profile
        </Link>
      </main>
    );
  }

  const { data: listings, error } = await getSellerListings(ctx.profile.id);

  return (
    <main className="sel-page">
      <header className="dashboard-header">
        <h1>Listings</h1>
        <Link href="/seller/listings/new" className="button button-primary">
          New listing
        </Link>
      </header>

      {error && (
        <p className="sel-banner-error" role="alert">
          {error}
        </p>
      )}

      {!error && listings.length === 0 && (
        <p className="sel-muted">No listings yet. Create your first service.</p>
      )}

      <ul className="sel-stack">
        {listings.map((l) => (
          <li key={l.id} className="sel-stack-item">
            <div>
              <strong>{l.title}</strong>
              <span className={`status-pill status-${l.status}`}>{l.status}</span>
              <p className="muted small">
                {l.category?.name ?? "Uncategorised"}
              </p>
            </div>
            <div className="seller-list-actions">
              <Link
                href={`/seller/listings/${l.id}/edit`}
                className="button button-secondary button-sm"
              >
                Edit
              </Link>
              {l.status !== "archived" && (
                <form
                  action={async () => {
                    "use server";
                    await archiveListing(l.id);
                  }}
                >
                  <button type="submit" className="button button-secondary button-sm">
                    Archive
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
