# Getting into /admin

`/admin` is only for users listed in `public.user_roles` with role `admin`. There is no sign-up or invite path for admins by design.

## Checklist

1. **Vercel env vars (Production)** — set, then redeploy:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `NEXT_PUBLIC_SITE_URL` = `https://dunara-marketplace.vercel.app` (or your custom domain)
2. **Supabase → Authentication → URL Configuration**
   - Site URL: your production URL
   - Redirect URLs: add `https://dunara-marketplace.vercel.app/**`
3. **Migrations** — all files in `supabase/migrations/` applied, especially `20261119180000_admin_control_centre.sql` (creates `user_roles` and `is_admin()`).
4. **Register** on the live site with the admin email and confirm it. If the email doesn't arrive or links to localhost, confirm manually with the optional statement in `supabase/seed/02_provision_admin.sql`.
5. **Grant admin** by running `supabase/seed/02_provision_admin.sql` with the email filled in.
6. Sign in. Admins go straight to `/admin`. There is intentionally no link to `/admin` anywhere in the public site or the seller dashboard; bookmark the URL.

## What you'll see

| Situation | Result |
| --- | --- |
| Signed out, open `/admin` | Sent to `/login?next=/admin` (expected) |
| Signed in, not an admin | Normal 404 page (the admin area is not revealed) |
| Signed in as admin | Admin console |

If you stay on `/login?next=/admin` after submitting the form, read the red message above the form: it says whether the credentials are wrong or the email is not confirmed.
