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
      description="Sign in with the email you registered to manage your shop."
      footer={
        <>
          New to Dunara?{" "}
          <Link href="/register" className="font-semibold text-[var(--color-primary)] hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense
        fallback={
          <div className="space-y-5" aria-busy="true" aria-label="Loading sign in form">
            <div className="h-11 animate-pulse rounded-xl bg-[var(--color-border)]" />
            <div className="h-11 animate-pulse rounded-xl bg-[var(--color-border)]" />
            <div className="h-12 animate-pulse rounded-xl bg-[var(--color-border)]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
