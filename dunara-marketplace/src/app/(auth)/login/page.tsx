import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getUser } from "@/features/auth/lib/get-user";
import { redirect } from "next/navigation";
import { safeInternalPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Dunara seller account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getUser();
  if (user) {
    // Already signed in: go where they were headed (never back to an auth page)
    const target = safeInternalPath(next, "/seller");
    redirect(target.startsWith("/login") || target.startsWith("/register") ? "/seller" : target);
  }

  return (
    <AuthCard
      variant="login"
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
