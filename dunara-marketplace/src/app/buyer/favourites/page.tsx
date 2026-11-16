import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBuyerContext } from "@/features/buyer/lib/context";
import { getBuyerFavourites } from "@/features/buyer/lib/queries";
import { removeFavourite } from "@/features/buyer/actions/buyer-actions";

export const metadata: Metadata = { title: "Favourites" };

export default async function BuyerFavouritesPage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/favourites");

  const { data, error } = await getBuyerFavourites(ctx.user.id);
  const providers = data.filter((f) => f.seller_id);
  const services = data.filter((f) => f.listing_id);

  return (
    <main className="buy-page">
      <BuyerPageHeader
        title="Favourites"
        description="Providers and services you saved."
      />

      {error && <p className="buy-banner-error">{error}</p>}

      {!error && data.length === 0 && (
        <div className="buy-panel">
          <p className="buy-muted">Nothing saved yet.</p>
          <Link href="/providers" className="button button-primary">
            Browse providers
          </Link>
        </div>
      )}

      {providers.length > 0 && (
        <section className="buy-panel">
          <h2>Saved providers</h2>
          <ul className="buy-stack">
            {providers.map((f) => (
              <li key={f.id} className="buy-stack-item">
                <div>
                  <Link href={`/providers/${f.seller?.slug}`}>
                    <strong>{f.seller?.business_name ?? "Provider"}</strong>
                  </Link>
                  {f.seller?.is_verified && (
                    <span className="status-pill status-published">Verified</span>
                  )}
                </div>
                <form
                  action={async () => {
                    "use server";
                    await removeFavourite(f.id);
                  }}
                >
                  <button type="submit" className="button button-secondary button-sm">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {services.length > 0 && (
        <section className="buy-panel">
          <h2>Favourite services</h2>
          <ul className="buy-stack">
            {services.map((f) => (
              <li key={f.id} className="buy-stack-item">
                <div>
                  <Link href={`/services/${f.listing?.slug}`}>
                    <strong>{f.listing?.title ?? "Service"}</strong>
                  </Link>
                  <span className={`status-pill status-${f.listing?.status}`}>
                    {f.listing?.status}
                  </span>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await removeFavourite(f.id);
                  }}
                >
                  <button type="submit" className="button button-secondary button-sm">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
