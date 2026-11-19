# Dunara Authentication (Email-first)

## Flows

1. **Register** — full name, email, password, terms acceptance → Supabase `signUp` → confirmation email → `/check-email`
2. **Confirm email** — user clicks link → `/auth/callback` exchanges code → session + profile upsert → `/seller`
3. **Login** — email + password → session → `/seller` (or `?next=` safe path)
4. **Forgot password** — email → recovery link (same response whether account exists)
5. **Reset password** — recovery session required → `updateUser({ password })` → `/seller`
6. **Logout** — `signOut` → `/login`
7. **Resend confirmation** — from check-email page

WhatsApp number is **not** collected at registration.

## Routes

| Path | Purpose |
|------|---------|
| `/register` | Sign up |
| `/login` | Sign in |
| `/forgot-password` | Request reset |
| `/reset-password` | Set new password (requires recovery session) |
| `/check-email` | Post-signup instructions + resend |
| `/auth/callback` | Code exchange for confirm / recovery |
| `/seller/*` | Protected (middleware + `requireUser`) |

## Profile creation

1. DB trigger `handle_new_user` on `auth.users` insert creates `profiles` row (`id = auth.users.id`).
2. Auth callback also calls `ensureProfile` (idempotent upsert) so repeated callbacks are safe.

Never trust a client-supplied user id for profile writes.

## Supabase Dashboard configuration

### Auth URL configuration

In **Authentication → URL configuration**:

- **Site URL**: `https://your-domain.com` (or `http://localhost:3000` for local)
- **Redirect URLs** (allow list):
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback`
  - Include any preview deploy URLs you use

### Email templates

- **Confirm signup**: ensure the link uses the Site URL / redirect to `/auth/callback`
- **Reset password**: same callback path with `next=/reset-password`

Enable **Confirm email** under Authentication → Providers → Email for production.

### Environment

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` is not required for these auth flows.

## Security notes

- Middleware redirects unauthenticated `/seller` traffic to `/login?next=...`
- Seller layout also calls `requireUser()` (server)
- Open redirects blocked: `next` must start with `/` and not `//`
- Password min length 8; validated server-side with Zod
- Error messages avoid account enumeration where practical
