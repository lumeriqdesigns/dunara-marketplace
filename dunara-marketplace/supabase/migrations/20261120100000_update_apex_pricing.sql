-- Update Apex subscription prices to the approved Dunara pricing.
-- Paystack plan codes are external references and must be updated separately
-- in the Paystack dashboard if recurring plan codes have already been created.
update public.plans
set price_kobo = case slug
  when 'apex_monthly' then 2000000  -- ₦20,000
  when 'apex_annual'  then 19200000 -- ₦192,000
  else price_kobo
end,
updated_at = now()
where slug in ('apex_monthly', 'apex_annual');
