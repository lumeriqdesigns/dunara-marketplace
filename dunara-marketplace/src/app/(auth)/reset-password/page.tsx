import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Reset password"
};

export default function ResetPasswordPage() {
  return (
    <main className="auth-page">
      <AuthForm mode="reset" />
    </main>
  );
}
