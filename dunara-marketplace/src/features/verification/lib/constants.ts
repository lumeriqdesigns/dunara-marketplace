export const VERIFICATION_BUCKET = "verification-documents";

import { MAX_UPLOAD_BYTES } from "@/lib/upload-limits";

export const MAX_FILE_BYTES = MAX_UPLOAD_BYTES; // 1MB
export const MAX_FILES = 5;

export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export type AllowedMime = (typeof ALLOWED_MIME)[number];

export function extensionForMime(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "application/pdf":
      return "pdf";
    default:
      return null;
  }
}

export const EVIDENCE_HELP =
  "Upload clear photos or PDFs of a government-issued ID and/or business registration document. Files stay private and are only reviewed by Dunara admins.";
