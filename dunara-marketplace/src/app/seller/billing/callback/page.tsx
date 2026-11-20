import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/features/auth/lib/require-user";
import { confirmPaymentReference } from "@/features/billing/actions";
import { PageHeader } from "@/features/seller/components/PageHeader";

export const metadata: Metadata = { title: "Payment confirmation" };

export default async function BillingCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  await requireUser("/seller/billing/callback");
  const params = await searchParams;
  const reference = params.reference || params.trxref;

  if (!reference) {
    return (
      <div className="space-y-4">
        <PageHeader title="Payment" description="Missing payment reference." />
        <Link href="/seller/billing" className="text-sm text-[var(--color-primary)]">
          Back to billing
        </Link>
      </div>
    );
  }

  const result = await confirmPaymentReference(reference);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <PageHeader
        title={result.ok ? "Payment confirmed" : "Payment not completed"}
        description={result.message}
      />
      <Link
        href="/seller/billing"
        className="inline-flex text-sm font-medium text-[var(--color-primary)]"
      >
        View billing →
      </Link>
    </div>
  );
}
