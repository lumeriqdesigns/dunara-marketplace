-- =============================================================================
-- Module 11 — Seller Verification
-- Private document storage + atomic approve/reject RPCs
-- verification_requests table already exists from core schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Private storage bucket for verification documents
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification-documents',
  'verification-documents',
  false,
  5242880, -- 5MB per object
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: {shop_id}/{request_id}/{random}.{ext}
-- Seller may upload/read only under shops they own (first folder = shop_id)

drop policy if exists "verification_docs_seller_select" on storage.objects;
create policy "verification_docs_seller_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "verification_docs_seller_insert" on storage.objects;
create policy "verification_docs_seller_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verification-documents'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );

drop policy if exists "verification_docs_seller_delete" on storage.objects;
create policy "verification_docs_seller_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and public.is_shop_owner((split_part(name, '/', 1))::uuid)
  );

-- Admins may read via signed URLs created with service role after requireAdmin().
-- Optional: allow admin select through is_admin for storage UI debugging
drop policy if exists "verification_docs_admin_select" on storage.objects;
create policy "verification_docs_admin_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Atomic approve
-- ---------------------------------------------------------------------------
create or replace function public.admin_approve_verification(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_req public.verification_requests%rowtype;
  v_updated int;
begin
  if v_admin is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  select * into v_req from public.verification_requests where id = p_request_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_req.status <> 'pending' then
    return jsonb_build_object('ok', false, 'error', 'conflict', 'status', v_req.status);
  end if;

  update public.verification_requests
  set
    status = 'approved',
    reviewed_by = v_admin,
    reviewed_at = now(),
    rejection_reason = null,
    updated_at = now()
  where id = p_request_id and status = 'pending';
  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    return jsonb_build_object('ok', false, 'error', 'conflict');
  end if;

  update public.shops
  set
    verification_status = 'verified',
    verified_at = now(),
    verification_note = null,
    updated_at = now()
  where id = v_req.shop_id;

  insert into public.admin_audit_logs (admin_user_id, action, target_type, target_id, reason, metadata)
  values (
    v_admin,
    'verification_approved',
    'verification_request',
    p_request_id,
    null,
    jsonb_build_object('shop_id', v_req.shop_id, 'priority', v_req.priority)
  );

  return jsonb_build_object('ok', true, 'shop_id', v_req.shop_id);
end;
$$;

revoke all on function public.admin_approve_verification(uuid) from public;
grant execute on function public.admin_approve_verification(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Atomic reject
-- ---------------------------------------------------------------------------
create or replace function public.admin_reject_verification(
  p_request_id uuid,
  p_rejection_reason text,
  p_admin_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_req public.verification_requests%rowtype;
  v_updated int;
begin
  if v_admin is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  if p_rejection_reason is null or length(trim(p_rejection_reason)) < 3 or length(p_rejection_reason) > 1000 then
    return jsonb_build_object('ok', false, 'error', 'invalid_reason');
  end if;

  select * into v_req from public.verification_requests where id = p_request_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_req.status <> 'pending' then
    return jsonb_build_object('ok', false, 'error', 'conflict', 'status', v_req.status);
  end if;

  update public.verification_requests
  set
    status = 'rejected',
    reviewed_by = v_admin,
    reviewed_at = now(),
    rejection_reason = trim(p_rejection_reason),
    admin_note = nullif(trim(coalesce(p_admin_note, '')), ''),
    updated_at = now()
  where id = p_request_id and status = 'pending';
  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    return jsonb_build_object('ok', false, 'error', 'conflict');
  end if;

  update public.shops
  set
    verification_status = 'rejected',
    verification_note = trim(p_rejection_reason),
    updated_at = now()
  where id = v_req.shop_id;

  insert into public.admin_audit_logs (admin_user_id, action, target_type, target_id, reason, metadata)
  values (
    v_admin,
    'verification_rejected',
    'verification_request',
    p_request_id,
    trim(p_rejection_reason),
    jsonb_build_object('shop_id', v_req.shop_id, 'priority', v_req.priority)
  );

  return jsonb_build_object('ok', true, 'shop_id', v_req.shop_id);
end;
$$;

revoke all on function public.admin_reject_verification(uuid, text, text) from public;
grant execute on function public.admin_reject_verification(uuid, text, text) to authenticated;

comment on function public.admin_approve_verification is 'Admin-only atomic approve: request + shop verified + audit';
comment on function public.admin_reject_verification is 'Admin-only atomic reject: request + shop rejected note + audit';
