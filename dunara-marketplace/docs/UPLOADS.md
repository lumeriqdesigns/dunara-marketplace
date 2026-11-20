# Uploads

- **Limit:** 1MB per file, on every plan (Free, Pulse, Apex). Defined once in `src/lib/upload-limits.ts`.
- **Browser:** photos (JPEG/PNG/WebP) over 1MB are resized/re-encoded automatically by `src/lib/image-compress.ts`
  before upload (`CompressedFileInput` for logo and listing images; `VerificationSubmitForm` for verification).
  PNG logos/listing images keep transparency via WebP (JPEG fallback on Safari); verification PNGs become JPEG.
  GIFs and PDFs cannot be compressed and are only size-checked.
- **Server:** every upload action re-checks `isOverUploadLimit` (never trust the browser).
- **Storage:** buckets `shop-logos`, `listing-images`, `verification-documents` are capped at 1MB by
  `supabase/migrations/20261120110000_upload_limit_1mb.sql`.
- **Request size:** `next.config.ts` sets Server Actions `bodySizeLimit` to 6mb (5 verification files x 1MB + overhead).
- To change the limit, edit `MAX_UPLOAD_BYTES`, add a migration for the bucket limits, and update the Terms/Privacy wording.
