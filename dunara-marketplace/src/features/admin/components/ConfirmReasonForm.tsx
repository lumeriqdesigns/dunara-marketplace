"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  title: string;
  description?: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: (reason: string) => Promise<{ ok: boolean; message?: string }>;
};

export function ConfirmReasonForm({
  title,
  description,
  confirmLabel,
  destructive,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await onConfirm(reason);
      if (result.ok) {
        toast.success(result.message ?? "Done");
        setOpen(false);
        setReason("");
      } else {
        toast.error(result.message ?? "Action failed");
      }
    });
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant={destructive ? "destructive" : "outline"}
        size="sm"
        onClick={() => setOpen(true)}
      >
        {confirmLabel}
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)] p-3"
    >
      <div>
        <p className="text-sm font-medium text-[var(--color-ink)]">{title}</p>
        {description ? (
          <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{description}</p>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-reason">Reason (required)</Label>
        <Textarea
          id="admin-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          minLength={3}
          maxLength={500}
          rows={3}
          required
          placeholder="Explain why this action is needed"
          disabled={pending}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" variant={destructive ? "destructive" : "default"} disabled={pending}>
          {pending ? "Working…" : confirmLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setReason("");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
