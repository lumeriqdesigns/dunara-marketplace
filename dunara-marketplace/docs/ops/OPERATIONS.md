# Dunara operations runbook

## Backups

- **Database:** Use Supabase automatic backups (Pro) or scheduled `pg_dump` for critical milestones.
- **Storage:** Private verification documents are not in git; rely on Supabase storage redundancy + export procedures for compliance needs.
- **App:** Vercel immutable deployments allow instant rollback to a previous deployment.

### Restore

1. Identify last known-good migration version and Vercel deployment.
2. Database restore: Supabase dashboard PITR / restore backup (coordinate downtime).
3. Re-apply any migrations newer than the backup if needed.
4. Redeploy matching app git SHA from Vercel.

**Do not** drop production tables to “fix” schema drift without a backup.

## Migration rollback approach

Migrations are **additive**. Prefer:

1. Fix-forward with a new migration
2. Feature-disable via env (remove AI key, Paystack webhook, etc.)

Avoid destructive down-migrations on production.

## Admin access

**Grant** (trusted operator only):

```sql
insert into public.user_roles (user_id, role)
values ('<uuid>', 'admin')
on conflict (user_id) do update set role = excluded.role;
```

**Revoke:**

```sql
delete from public.user_roles where user_id = '<uuid>';
```

Confirm the user can no longer load `/admin`.

## Failed payment webhooks

1. Check Vercel function logs for `/api/webhooks/paystack` (no secrets in logs).
2. Inspect `payment_events` for `paystack_event_id`, `processed`, `processing_error`.
3. Replay from Paystack dashboard only if signature and idempotency allow; do not double-activate.
4. Confirm plan amount matches `plans.price_kobo` if amount mismatch errors appear.

## Orphaned private uploads

If verification files were uploaded but DB insert failed, seller cleanup attempts remove paths; residual objects may remain under `{shop_id}/{request_id}/`.

- List with service role in Dashboard (filter by shop_id prefix)
- Delete orphans only after confirming no `verification_requests.document_paths` reference

Never make the verification bucket public.

## Mistakenly suspended shops

1. Admin → Shops → shop detail → **Restore** with reason  
   or RPC `admin_set_shop_suspension(shop_id, false, reason)`
2. Confirm `is_suspended = false` and public page returns if `is_published`
3. Audit log should show `shop_restored`

## Monitoring

Recommended (owner-configured):

- Vercel Analytics / error monitoring (e.g. built-in logs)
- Supabase Auth and API error dashboards
- Uptime check on `/` and `/api/webhooks/paystack` (HEAD/GET as appropriate)

**Never log:** service role keys, Paystack secrets, AI keys, verification document bytes, signed URLs, OTPs, full card data.

## Incident severity (suggested)

| Level | Example | Action |
|-------|---------|--------|
| P1 | Auth down, data leak, webhook forging accepted | Disable deploy / rotate secrets / take read-only |
| P2 | Checkout broken, RLS regression | Hotfix + staging verify |
| P3 | AI provider outage | Disable AI key; rest of marketplace stays up |
