import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Forgot password"
};

export default function ForgotPasswordPage() {
  return (
    <main className="auth-page">
      <AuthForm mode="forgot" />
    </main>
  );
}
