import { asFormAction } from "@/lib/forms/as-form-action";
import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBuyerContext } from "@/features/buyer/lib/context";
import { getBuyerNotifications } from "@/features/buyer/lib/queries";
import {
  markAllNotificationsRead,
  markNotificationRead
} from "@/features/buyer/actions/buyer-actions";

export const metadata: Metadata = { title: "Notifications" };

export default async function BuyerNotificationsPage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/notifications");

  const { data, error } = await getBuyerNotifications(ctx.user.id);
  const unread = data.filter((n) => !n.is_read).length;

  return (
    <main className="buy-page">
      <header className="dashboard-header">
        <div>
          <BuyerPageHeader
        title="Notifications"
        description="Alerts about bookings, messages and reviews."
      />
        </div>
        {unread > 0 && (
          <form action={asFormAction(markAllNotificationsRead)}>
            <button type="submit" className="button button-secondary button-sm">
              Mark all read
            </button>
          </form>
        )}
      </header>

      {error && <p className="buy-banner-error">{error}</p>}
      {!error && data.length === 0 && (
        <p className="buy-muted">No notifications yet.</p>
      )}

      <ul className="buy-stack">
        {data.map((n) => (
          <li
            key={n.id}
            className={`seller-list-item ${n.is_read ? "" : "notification-unread"}`}
          >
            <div>
              <strong>{n.title}</strong>
              {n.body && <p className="muted small">{n.body}</p>}
              <p className="muted small">
                {n.type} · {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            {!n.is_read && (
              <form
                action={async () => {
                  "use server";
                  await markNotificationRead(n.id);
                }}
              >
                <button type="submit" className="button button-secondary button-sm">
                  Mark read
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
