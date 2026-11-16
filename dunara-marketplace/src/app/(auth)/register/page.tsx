import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Create account",
  description: `Join ${brand.name}`
};

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <AuthForm mode="register" nextPath="/buyer/dashboard" />
    </main>
  );
}
