-- =============================================================================
-- Provision an admin (run manually in Supabase → SQL Editor)
--
-- Admins cannot be created from the website on purpose. The person must first
-- register on the live site with this email and confirm it, then run this.
-- =============================================================================

-- 1) Make the user an admin (replace the email)
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where lower(email) = lower('YOUR_EMAIL_HERE')
on conflict (user_id) do nothing;

-- 2) Check it worked: you should see one row with role = 'admin'
select u.email, r.role, u.email_confirmed_at
from public.user_roles r
join auth.users u on u.id = r.user_id;

-- OPTIONAL: if the confirmation email never arrived or its link pointed to localhost,
-- confirm the account manually so the person can sign in.
-- update auth.users
--   set email_confirmed_at = now()
--   where lower(email) = lower('YOUR_EMAIL_HERE') and email_confirmed_at is null;

-- OPTIONAL: remove admin access
-- delete from public.user_roles
--   where user_id = (select id from auth.users where lower(email) = lower('YOUR_EMAIL_HERE'));
