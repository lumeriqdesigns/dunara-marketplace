import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { getSellerAreas } from "@/features/seller/lib/queries";
import { isSeller } from "@/lib/permissions";
import {
  addServiceArea,
  removeServiceArea
} from "@/features/seller/actions/seller-actions";

export const metadata: Metadata = { title: "Service areas" };

export default async function SellerAreasPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/areas");
  if (!isSeller(ctx.user) || !ctx.profile) redirect("/seller/dashboard");

  const { data: areas, error } = await getSellerAreas(ctx.profile.id);

  return (
    <main className="sel-page">
      <SellerPageHeader
        title="Service areas"
        description="Cities and neighbourhoods where you take work."
      />

      {error && <p className="sel-banner-error">{error}</p>}

      <ul className="sel-stack">
        {areas.map((a) => (
          <li key={a.id} className="sel-stack-item">
            <div>
              <strong>
                {a.city}
                {a.neighbourhood ? ` · ${a.neighbourhood}` : ""}
              </strong>
              <p className="muted small">
                {[a.lga, a.state].filter(Boolean).join(", ")}
                {a.is_primary ? " · Primary" : ""}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await removeServiceArea(a.id);
              }}
            >
              <button type="submit" className="button button-secondary button-sm">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>

      <section className="sel-panel">
        <h2>Add area</h2>
        <form
          className="sel-form"
          action={async (fd) => {
            "use server";
            await addServiceArea(fd);
          }}
        >
          <label>
            State *
            <input name="state" required placeholder="Kwara" />
          </label>
          <label>
            City *
            <input name="city" required placeholder="Ilorin" />
          </label>
          <label>
            LGA
            <input name="lga" placeholder="Ilorin South" />
          </label>
          <label>
            Neighbourhood
            <input name="neighbourhood" placeholder="Tanke" />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" name="is_primary" /> Primary area
          </label>
          <button type="submit" className="button button-primary">
            Add area
          </button>
        </form>
      </section>
    </main>
  );
}
