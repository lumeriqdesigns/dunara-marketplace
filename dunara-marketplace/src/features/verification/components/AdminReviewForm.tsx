"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
      <p className="text-sm text-[var(--color-muted)]">
        This request is already <strong>{status}</strong>. No further action needed.
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
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] p-4">
        <p className="text-sm font-medium text-[var(--color-ink)]">Approve</p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Sets the shop to verified and shows the public badge. This is a manual review
          confirmation, not a product-quality guarantee.
        </p>
        <Button
          type="button"
          className="mt-3"
          disabled={pending}
          onClick={onApprove}
        >
          {pending ? "Working…" : "Approve verification"}
        </Button>
      </div>

      <form
        onSubmit={onReject}
        className="space-y-3 rounded-lg border border-[var(--color-border)] bg-white p-4"
      >
        <p className="text-sm font-medium text-[var(--color-ink)]">Reject</p>
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
        <Button type="submit" variant="destructive" disabled={pending}>
          {pending ? "Working…" : "Reject"}
        </Button>
      </form>
    </div>
  );
}
