/**
 * Single source of truth for upload size limits (Supabase storage is limited).
 * The limit is the same on every plan (Free, Pulse, Apex): nothing here or in the
 * upload actions reads the seller's entitlement.
 * Keep in sync with the bucket file_size_limit in
 * supabase/migrations/20261120110000_upload_limit_1mb.sql.
 */
export const MAX_UPLOAD_BYTES = 1 * 1024 * 1024; // 1MB
export const MAX_UPLOAD_LABEL = "1MB";

export function isOverUploadLimit(file: { size: number }): boolean {
  return file.size > MAX_UPLOAD_BYTES;
}

export function uploadTooLargeMessage(what = "File"): string {
  return `${what} must be ${MAX_UPLOAD_LABEL} or smaller. Please compress or resize it and try again.`;
}
