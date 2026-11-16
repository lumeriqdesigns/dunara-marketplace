import { asFormAction } from "@/lib/forms/as-form-action";
import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBuyerContext } from "@/features/buyer/lib/context";
import {
  updateBuyerAccount,
  updateBuyerPreferences
} from "@/features/buyer/actions/buyer-actions";

export const metadata: Metadata = { title: "Buyer profile" };

export default async function BuyerProfilePage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/profile");

  return (
    <main className="buy-page">
      <BuyerPageHeader
        title="Your profile"
        description="How you appear when messaging providers."
      />

      <section className="buy-panel">
        <h2>Account</h2>
        <form className="seller-form" action={asFormAction(updateBuyerAccount)}>
          <label>
            Display name
            <input
              name="display_name"
              defaultValue={ctx.profile?.display_name ?? ""}
            />
          </label>
          <label>
            Phone
            <input name="phone" defaultValue={ctx.profile?.phone ?? ""} />
          </label>
          <p className="muted small">Email: {ctx.user.email ?? "—"}</p>
          <button type="submit" className="button button-primary">
            Save account
          </button>
        </form>
      </section>

      <section className="buy-panel">
        <h2>Preferences</h2>
        <form className="seller-form" action={asFormAction(updateBuyerPreferences)}>
          <label>
            Preferred city
            <input
              name="preferred_city"
              defaultValue={ctx.buyerProfile?.preferred_city ?? ""}
              placeholder="Ilorin"
            />
          </label>
          <label>
            Preferred state
            <input
              name="preferred_state"
              defaultValue={ctx.buyerProfile?.preferred_state ?? ""}
              placeholder="Kwara"
            />
          </label>
          <label>
            Notes
            <textarea
              name="notes"
              rows={3}
              defaultValue={ctx.buyerProfile?.notes ?? ""}
            />
          </label>
          <button type="submit" className="button button-primary">
            Save preferences
          </button>
        </form>
      </section>
    </main>
  );
}
