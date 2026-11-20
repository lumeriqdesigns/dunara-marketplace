# Dunara Seller Verification (Module 11)

## Product rules

- Eligible: **Pulse** and **Apex** only (`canApplyVerification` from server entitlements).
- Open cannot apply (UI + server action).
- Manual admin review only — no external KYC, liveness, or biometrics.
- Apex `priority` is snapshotted at submission time (queue order only).
- Earned `shops.verification_status = verified` is **not** cleared on plan downgrade.

## Data

Table `verification_requests` (core schema):

- `document_paths text[]` — private object paths only (never public URLs)
- One pending request per shop (partial unique index)
- `rejection_reason` seller-visible; `admin_note` internal

Shop fields: `verification_status`, `verified_at`, `verification_note`

## Storage

Bucket: **`verification-documents`** (private)

- MIME: `image/jpeg`, `image/png`, `application/pdf`
- Max 1MB / object, max 5 files per submission
- Path: `{shop_id}/{request_id}/{uuid}.{ext}`
- Seller storage policies: own shop path only
- Admin document access: `requireAdmin` → service-role **signed URL** (~120s)
- Never store signed URLs in the database

Migration: `20261119190000_seller_verification.sql`

## Routes

| Path | Role |
|------|------|
| `/seller/verification` | Seller status, upload, history |
| `/admin/verifications` | Pending queue |
| `/admin/verifications/[id]` | Secure preview + approve/reject |

## Server operations

- `getSellerVerificationStatus`
- `submitVerificationRequest` (entitlement check, validate files, upload, insert, shop → pending)
- `getAdminVerificationDetail` (signed URLs)
- `approveVerification` → RPC `admin_approve_verification`
- `rejectVerification` → RPC `admin_reject_verification`

Approve/reject are atomic: request status + shop badge fields + audit log, conditional on `status = 'pending'`.

## Badge

Public UI reads `shops.verification_status === 'verified'` only. No document paths, rejection notes, or admin notes on public pages.

## Manual setup

1. Apply migration `20261119190000_seller_verification.sql` (bucket + RPCs + storage policies).
2. Confirm storage policies in Supabase Dashboard if SQL bucket creation is restricted.
3. Provision at least one admin (Module 10).
4. Smoke-test: Pulse seller upload → admin approve → public shop shows Verified.
