import { asFormAction } from "@/lib/forms/as-form-action";
import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSellerContext } from "@/features/seller/lib/context";
import { logout } from "@/features/auth/actions/auth-actions";
import { getNotificationPreferences } from "@/features/notifications/actions/notification-actions";
import { NotificationPreferencesForm } from "@/features/notifications/components/preferences-form";

export const metadata: Metadata = { title: "Seller settings — Dúnarà Marketplace" };

export default async function SellerSettingsPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/settings");

  const { data: prefs } = await getNotificationPreferences();

  return (
    <main className="sel-page">
      <h1>Account settings</h1>
      <section className="sel-panel">
        <h2>Account</h2>
        <p className="sel-muted">Signed in as {ctx.user.email ?? ctx.user.id}</p>
        <p className="muted small">Roles: {ctx.user.roles.join(", ") || "none"}</p>
        <form action={asFormAction(logout)}>
          <button type="submit" className="button button-secondary">
            Sign out
          </button>
        </form>
      </section>
      <section className="sel-panel">
        <h2>Notifications</h2>
        <p className="muted small mb-3">
          Choose which updates you receive. Email and push require a configured provider.
        </p>
        <NotificationPreferencesForm initial={prefs} />
      </section>
      <section className="sel-panel">
        <h2>Password</h2>
        <p>
          Use <Link href="/forgot-password">password recovery</Link> to reset your
          password securely via email.
        </p>
      </section>
      <section className="sel-panel">
        <h2>Business</h2>
        <p>
          <Link href="/seller/profile">Edit business profile</Link>
        </p>
      </section>
    </main>
  );
}
