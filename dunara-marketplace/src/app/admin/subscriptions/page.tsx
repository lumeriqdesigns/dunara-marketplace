import { getAdminSubscriptionHealth } from "@/features/admin/actions";
import { subscriptionBadge } from "@/features/admin/components/StatusBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Admin subscriptions · Dunara" };

export default async function AdminSubscriptionsPage() {
  const result = await getAdminSubscriptionHealth();
  if (!result.ok || !result.data) {
    return (
      <EmptyState
        title="Could not load subscriptions"
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
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
          Subscriptions
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Read-only health view. Paystack webhooks remain the payment source of truth.
          Admins cannot mark payments successful from this console.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-[var(--color-muted)]">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No subscriptions yet" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-canvas)] text-xs uppercase text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Period end</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-ink)]">
                      {row.shop_name ?? row.shop_id}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {row.plan_name ?? row.plan_slug ?? "—"}
                    {row.billing_interval ? ` · ${row.billing_interval}` : ""}
                  </td>
                  <td className="px-4 py-3">{subscriptionBadge(row.status)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)]">
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
