import Link from "next/link";
import { searchProviders } from "@/features/marketplace/lib/queries";
import { ProviderCard } from "@/features/marketplace/components/provider-card";

/**
 * Homepage row of real active providers only.
 * Hidden when Supabase is empty or misconfigured — never padded with fakes.
 */
export async function ActiveProvidersRow() {
  const { data: providers, error } = await searchProviders({}, 4);

  if (error || !providers.length) {
    return null;
  }

  return (
    <section className="active-providers-section" aria-labelledby="active-providers-heading">
      <div className="container">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Local talent</p>
            <h2 id="active-providers-heading">Active providers</h2>
            <p className="section-sub">
              Real business profiles on Dúnarà — verification and ratings only when recorded.
            </p>
          </div>
          <Link href="/providers" className="text-link">
            View all providers
          </Link>
        </div>
        <div className="provider-grid">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
