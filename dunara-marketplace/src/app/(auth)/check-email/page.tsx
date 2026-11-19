import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ResendConfirmationForm } from "@/features/auth/components/ResendConfirmationForm";

export const metadata: Metadata = {
  title: "Check your email",
};

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";

  return (
    <AuthCard
      title="Check your email"
      description={
        email
          ? `We sent a confirmation link to ${email}. Open the link to verify your account and continue.`
          : "We sent a confirmation link to your email. Open the link to verify your account and continue."
      }
      footer={
        <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-sm text-[var(--color-muted)]">
        Didn’t get the email? Check spam, or resend below. The link expires after a limited time.
      </div>
      {email ? <ResendConfirmationForm email={email} /> : null}
    </AuthCard>
  );
}
