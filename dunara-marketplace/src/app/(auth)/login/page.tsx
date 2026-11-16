import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/auth-form";
import { brand } from "@/config/brand";
import { safeNextPath } from "@/lib/auth/safe-next";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to ${brand.name}`
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/buyer/dashboard");

  return (
    <main className="auth-page">
      {params.error === "auth_callback_failed" && (
        <p className="auth-banner-error" role="alert">
          Sign-in link was invalid or expired. Please try again.
        </p>
      )}
      <AuthForm mode="login" nextPath={next} />
    </main>
  );
}
