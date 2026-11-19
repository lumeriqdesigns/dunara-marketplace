import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import { getUser } from "@/features/auth/lib/get-user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Set new password",
};

export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) {
    redirect("/forgot-password");
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Enter a new password for your Dunara account."
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
