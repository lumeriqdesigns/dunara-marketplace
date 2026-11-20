import { getAdminSubscriptionHealth } from "@/features/admin/actions";
import { subscriptionBadge } from "@/features/admin/components/StatusBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/features/seller/components/PageHeader";
import { StatCard } from "@/features/seller/components/StatCard";

export const metadata = { title: "Admin subscriptions · Dunara" };

export default async function AdminSubscriptionsPage() {
  const result = await getAdminSubscriptionHealth();
  if (!result.ok || !result.data) {
    return (
      <EmptyState
        title="Couldn’t load subscriptions"
        description={result.message}
      />
    );
  }

  const { counts, rows } = result.data;
  const cards = [
    { label: "Trialing", value: counts.trialing },
    { label: "Active", value: counts.active },
    { label: "Past due", value: counts.past_due },
    { label: "Cancelled", value: counts.cancelled },
    { label: "Free", value: counts.free },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Read-only health view. Paystack webhooks stay the source of truth for payments, and admins can’t mark a payment as successful from here."
      />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} />
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No subscriptions yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th scope="col">Shop</th>
                <th scope="col">Plan</th>
                <th scope="col">Status</th>
                <th scope="col">Period end</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <p className="font-medium text-[var(--color-ink)]">
                      {row.shop_name ?? row.shop_id}
                    </p>
                  </td>
                  <td className="text-[var(--color-muted)]">
                    {row.plan_name ?? row.plan_slug ?? "—"}
                    {row.billing_interval ? ` · ${row.billing_interval}` : ""}
                  </td>
                  <td>{subscriptionBadge(row.status)}</td>
                  <td className="text-xs text-[var(--color-muted)]">
                    {row.current_period_end
                      ? new Date(row.current_period_end).toLocaleDateString("en-NG")
                      : row.trial_ends_at
                        ? `Trial ends ${new Date(row.trial_ends_at).toLocaleDateString("en-NG")}`
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
