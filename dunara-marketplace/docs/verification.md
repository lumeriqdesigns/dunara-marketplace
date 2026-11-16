# Dúnarà Marketplace — Seller Verification (Prompt 10)

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs

## Scope

Verification levels: `basic`, `identity`, `business`, `professional`.

Sellers submit applications and private documents. Only `verification_officer` or
`super_admin` may approve, reject, or request additional information. Sellers
**cannot** set `is_verified` or approve their own applications.

Public badges reflect `seller_profiles.is_verified` and `verification_level` only.
They indicate completed checks — **not** a guarantee of service quality or full legal identity.

## Flow

```
Seller creates application (submitted)
        │
        ├── uploads private documents (verification-documents bucket)
        ▼
Officer queue (submitted / under_review / additional_info_required)
        │
        ├── under_review
        ├── request_info → seller uploads + resubmit → submitted
        ├── approve → set_seller_verification(true, level) + audit + notify
        └── reject → rejection_reason + audit + notify
```

## RPCs

| Function | Who | Purpose |
|----------|-----|---------|
| `verification_officer_decide` | Officer / super_admin | approve, reject, request_info, under_review |
| `verification_seller_resubmit` | Owning seller | additional_info_required → submitted |
| `set_seller_verification` | Officer / super_admin | Authoritative profile flags + audit |

## Security

- Private bucket `verification-documents` (not public)
- Document paths prefixed by uploader user id
- Signed URLs only (5 minutes) for authorised viewers
- Status transition trigger blocks illegal seller status changes
- Officers cannot decide applications where they are the seller
- Decision columns not granted for client UPDATE
- All decisions written to `audit_logs`

## Application routes

| Route | Audience |
|-------|----------|
| `/seller/verification` | Submit, upload docs, resubmit, history |
| `/admin/verification` | Officer review queue |

## Storage setup

Migration best-effort creates bucket `verification-documents`. Confirm in dashboard:

- Public: **false**
- MIME: PDF, JPEG, PNG, WebP
- Max size: 10 MiB

## Tests to run live

1. Seller cannot `UPDATE seller_profiles SET is_verified = true`
2. Seller cannot set application status to `approved`
3. Non-officer cannot call `verification_officer_decide`
4. Officer cannot decide own seller application
5. Non-owner cannot SELECT other sellers’ documents
6. Approve sets badge fields and audit row

---

## Hardening (Prompt 10.1)

| Change | Detail |
|--------|--------|
| Status/decision writes | RPC-only; `UPDATE` revoked from authenticated |
| Seller submit | `verification_seller_submit(level)` |
| Document INSERT | Only when application is draft/submitted/additional_info_required |
| Reject + badge | Clears `is_verified` when no other approved application remains |
| Open apps | Unique index one open app per seller+level |
| Rate limit | Max 5 applications created per seller per day |
| Officer app gate | `verification_officer` \| `super_admin` only |
| Document view | `/api/verification/document?id=` → 5-minute signed redirect after RLS |

### Live checks after `20261115190000_verification_hardening.sql`

1. Seller `UPDATE provider_verifications SET status = 'approved'` → denied
2. Officer direct `UPDATE status` → denied (no UPDATE privilege)
3. Non-officer `verification_officer_decide` → 42501
4. Document INSERT on approved application → denied
5. Reject sole approval → profile `is_verified = false`
6. Second open app same level → unique violation / error
