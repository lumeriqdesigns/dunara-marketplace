"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { compressImageToLimit } from "@/lib/image-compress";
import { MAX_UPLOAD_LABEL, isOverUploadLimit, uploadTooLargeMessage } from "@/lib/upload-limits";

/**
 * File input that shrinks photos in the browser to fit the upload limit, then swaps
 * the compressed file into the input so a normal <form action> submits it.
 * Reports busy state so the parent can disable its submit button meanwhile.
 */
export function CompressedFileInput({
  name,
  accept,
  what = "Image",
  allowWebp = true,
  className = "text-sm",
  onBusyChange,
}: {
  name: string;
  accept: string;
  what?: string;
  allowWebp?: boolean;
  className?: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  function setBusyBoth(v: boolean) {
    setBusy(v);
    onBusyChange?.(v);
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const original = input.files?.[0];
    if (!original) return;

    setBusyBoth(true);
    try {
      const result = await compressImageToLimit(original, { allowWebp });
      if (isOverUploadLimit(result)) {
        toast.error(uploadTooLargeMessage(what));
        input.value = "";
        return;
      }
      if (result !== original) {
        const dt = new DataTransfer();
        dt.items.add(result);
        input.files = dt.files;
      }
    } catch {
      toast.error("Could not process that image. Try another file.");
      input.value = "";
    } finally {
      setBusyBoth(false);
    }
  }

  return (
    <>
      <input ref={ref} type="file" name={name} accept={accept} onChange={onChange} className={className} />
      <span className="text-xs text-[var(--color-ink-soft)]">
        {busy ? "Optimising image…" : `Large photos are resized automatically (max ${MAX_UPLOAD_LABEL})`}
      </span>
    </>
  );
}
