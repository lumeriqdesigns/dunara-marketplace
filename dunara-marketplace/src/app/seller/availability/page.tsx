import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { getSellerAvailability } from "@/features/seller/lib/queries";
import { isSeller } from "@/lib/permissions";
import { upsertAvailabilityDay } from "@/features/seller/actions/seller-actions";

export const metadata: Metadata = { title: "Availability" };

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default async function SellerAvailabilityPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/availability");
  if (!isSeller(ctx.user) || !ctx.profile) redirect("/seller/dashboard");

  const { data: rows } = await getSellerAvailability(ctx.profile.id);
  const byDay = new Map(rows.map((r) => [r.day_of_week, r]));

  return (
    <main className="sel-page">
      <SellerPageHeader
        title="Availability"
        description="When you are generally available for bookings."
      />

      <div className="availability-grid">
        {DAYS.map((label, day) => {
          const row = byDay.get(day);
          return (
            <form
              key={day}
              className="seller-form availability-day"
              action={async (fd) => {
                "use server";
                await upsertAvailabilityDay(fd);
              }}
            >
              <input type="hidden" name="day_of_week" value={day} />
              <h3>{label}</h3>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="is_available"
                  defaultChecked={row?.is_available ?? false}
                />
                Available
              </label>
              <div className="form-row">
                <label>
                  Start
                  <input
                    type="time"
                    name="start_time"
                    defaultValue={row?.start_time?.slice(0, 5) ?? "09:00"}
                  />
                </label>
                <label>
                  End
                  <input
                    type="time"
                    name="end_time"
                    defaultValue={row?.end_time?.slice(0, 5) ?? "17:00"}
                  />
                </label>
              </div>
              <button type="submit" className="button button-secondary button-sm">
                Save
              </button>
            </form>
          );
        })}
      </div>
    </main>
  );
}
