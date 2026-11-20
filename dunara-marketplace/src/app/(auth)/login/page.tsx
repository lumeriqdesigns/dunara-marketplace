import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getUser } from "@/features/auth/lib/get-user";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Dunara seller account.",
};

export default async function LoginPage() {
  const user = await getUser();
  if (user) redirect("/seller");

  return (
    <AuthCard
      title="Sign in"
      description="Access your seller dashboard with the email you registered."
      footer={
        <>
          New to Dunara?{" "}
          <Link href="/register" className="font-medium text-[var(--color-primary)] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-[var(--color-border)]" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
