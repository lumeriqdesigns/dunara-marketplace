import Link from "next/link";
import type { Metadata } from "next";
import { Mail } from "lucide-react";
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
          ? `We sent a confirmation link to ${email}. Open it to verify your account and continue.`
          : "We sent a confirmation link to your email. Open it to verify your account and continue."
      }
      footer={
        <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-soft-green)] text-[var(--color-primary)]">
          <Mail aria-hidden="true" className="size-4" />
        </span>
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Didn’t get it? Check your spam folder or resend the email. The link expires after a while.
        </p>
      </div>
      {email ? <ResendConfirmationForm email={email} /> : null}
    </AuthCard>
  );
}
