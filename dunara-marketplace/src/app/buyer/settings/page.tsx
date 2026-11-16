import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBuyerContext } from "@/features/buyer/lib/context";
import { logout } from "@/features/auth/actions/auth-actions";
import { getNotificationPreferences } from "@/features/notifications/actions/notification-actions";
import { NotificationPreferencesForm } from "@/features/notifications/components/preferences-form";

export const metadata: Metadata = { title: "Buyer settings — Dúnarà Marketplace" };

export default async function BuyerSettingsPage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/settings");

  const { data: prefs } = await getNotificationPreferences();

  return (
    <main className="buy-page">
      <BuyerPageHeader
        title="Buyer settings"
        description="Preferences for your buyer account."
      />
      <section className="buy-panel">
        <h2>Session</h2>
        <p className="buy-muted">Signed in as {ctx.user.email ?? ctx.user.id}</p>
        <p className="muted small">Roles: {ctx.user.roles.join(", ") || "none"}</p>
        <form action={logout}>
          <button type="submit" className="button button-secondary">
            Sign out
          </button>
        </form>
      </section>
      <section className="buy-panel">
        <h2>Notifications</h2>
        <p className="muted small mb-3">
          Choose which updates you receive. In-app notifications always respect these
          event toggles. Email and push require a configured provider.
        </p>
        <NotificationPreferencesForm initial={prefs} />
      </section>
      <section className="buy-panel">
        <h2>Security</h2>
        <p>
          Reset your password via{" "}
          <Link href="/forgot-password">email recovery</Link>.
        </p>
      </section>
      <section className="buy-panel">
        <h2>Profile</h2>
        <p>
          <Link href="/buyer/profile">Edit profile and location preferences</Link>
        </p>
      </section>
    </main>
  );
}
