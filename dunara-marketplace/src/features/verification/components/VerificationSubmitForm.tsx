"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitVerificationRequest } from "@/features/verification/actions";
import { MAX_FILES } from "@/features/verification/lib/constants";
import { MAX_UPLOAD_LABEL, isOverUploadLimit, uploadTooLargeMessage } from "@/lib/upload-limits";
import { compressImageToLimit } from "@/lib/image-compress";

export function VerificationSubmitForm() {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      // Shrink large photos in the browser (PDFs cannot be shrunk and are only size-checked).
      const originals = fd.getAll("documents").filter((f): f is File => f instanceof File);
      const prepared = await Promise.all(
        originals.map((f) => compressImageToLimit(f, { allowWebp: false }))
      );
      if (prepared.some((f) => isOverUploadLimit(f))) {
        toast.error(uploadTooLargeMessage("Each file"));
        return;
      }
      fd.delete("documents");
      prepared.forEach((f) => fd.append("documents", f));
      const result = await submitVerificationRequest(fd);
      if (result.ok) {
        toast.success(result.message ?? "Submitted");
        form.reset();
        setNote("");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documents">Documents (PDF, JPG, or PNG)</Label>
        <input
          id="documents"
          name="documents"
          type="file"
          accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
          multiple
          required
          disabled={pending}
          className="block w-full text-sm text-[var(--color-ink-soft)] file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-[var(--color-soft-green)] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[var(--color-primary)]"
        />
        <p className="text-xs text-[var(--color-ink-soft)]">
          Up to {MAX_FILES} files, {MAX_UPLOAD_LABEL} each. Photos are resized automatically; PDFs must already be under {MAX_UPLOAD_LABEL}. Files are private and only
          visible to Dunara admins.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sellerNote">Optional note for reviewers</Label>
        <Textarea
          id="sellerNote"
          name="sellerNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="e.g. Business name matches CAC certificate"
          disabled={pending}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
