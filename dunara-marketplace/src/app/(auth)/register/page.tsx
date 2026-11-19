import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { getUser } from "@/features/auth/lib/get-user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Create account",
  description: "Register for Dunara to list your business.",
};

export default async function RegisterPage() {
  const user = await getUser();
  if (user) redirect("/seller");

  return (
    <AuthCard
      title="Create your account"
      description="Use your email to get started. WhatsApp number is collected later on your shop profile."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
