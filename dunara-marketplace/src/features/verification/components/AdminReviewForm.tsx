"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  approveVerification,
  rejectVerification,
} from "@/features/verification/actions";

export function AdminReviewForm({
  requestId,
  status,
}: {
  requestId: string;
  status: string;
}) {
  const [reason, setReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [pending, startTransition] = useTransition();

  if (status !== "pending") {
    return (
      <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-5 text-sm text-[var(--color-ink-soft)]">
        This request is already <strong className="text-[var(--color-ink)]">{status}</strong>. No
        further action needed.
      </p>
    );
  }

  function onApprove() {
    startTransition(async () => {
      const result = await approveVerification(requestId);
      if (result.ok) toast.success(result.message ?? "Approved");
      else toast.error(result.message);
    });
  }

  function onReject(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await rejectVerification(requestId, reason, adminNote || undefined);
      if (result.ok) toast.success(result.message ?? "Rejected");
      else toast.error(result.message);
    });
  }

  return (
    <div className="space-y-5">
      {/* Approve — positive, separated */}
      <div className="rounded-2xl border border-[var(--color-primary)]/25 bg-[var(--color-soft-green)] p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
            <CheckCircle2 aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-ink)]">Approve verification</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">
              Sets the shop to verified and shows the public badge. This is a manual review
              confirmation, not a product-quality guarantee.
            </p>
            <Button type="button" className="mt-4" disabled={pending} onClick={onApprove}>
              {pending ? "Working…" : "Approve"}
            </Button>
          </div>
        </div>
      </div>

      {/* Reject — destructive, clearly separated */}
      <form
        onSubmit={onReject}
        className="space-y-4 rounded-2xl border border-red-200 bg-white p-5 shadow-[var(--shadow-card)]"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-[var(--color-error)]">
            <XCircle aria-hidden="true" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-ink)]">Reject application</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">
              The seller sees the reason and can resubmit after fixing issues.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="rejection-reason">Seller-facing reason (required)</Label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minLength={3}
            maxLength={1000}
            rows={3}
            required
            disabled={pending}
            placeholder="Explain what the seller should fix before resubmitting"
            aria-required="true"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-note">Internal note (optional, never shown to seller)</Label>
          <Textarea
            id="admin-note"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            maxLength={1000}
            rows={2}
            disabled={pending}
          />
        </div>
        <Button type="submit" variant="destructive" disabled={pending || reason.trim().length < 3}>
          {pending ? "Working…" : "Reject"}
        </Button>
      </form>
    </div>
  );
}
