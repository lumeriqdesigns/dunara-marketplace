import type { Metadata } from "next";
import { requireUser } from "@/features/auth/lib/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/features/seller/components/PageHeader";
import { SettingsForm } from "@/features/seller/components/SettingsForm";

export const metadata: Metadata = {
  title: "Account settings",
};

export default async function SellerSettingsPage() {
  const user = await requireUser("/seller/settings");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const fullName =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    "";
  const email = profile?.email || user.email || "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Account details for your Dunara login. Shop contact details live under Shop."
      />
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <SettingsForm fullName={fullName} email={email} />
      </div>
    </div>
  );
}
