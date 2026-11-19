-- Dunara AI quota RPCs
create or replace function public.consume_ai_reply_quota(
  p_shop_id uuid,
  p_seller_id uuid,
  p_limit int,
  p_language text default null,
  p_personality text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period date;
  v_count int;
  v_usage_id uuid;
begin
  v_period := date_trunc('month', (timezone('Africa/Lagos', now()))::date)::date;

  if p_limit = -1 then
    insert into public.ai_usage_monthly (shop_id, period_start, reply_count, guide_count)
    values (p_shop_id, v_period, 1, 0)
    on conflict (shop_id, period_start) do update
      set reply_count = public.ai_usage_monthly.reply_count + 1, updated_at = now()
    returning id, reply_count into v_usage_id, v_count;

    insert into public.ai_reply_events (
      shop_id, seller_id, usage_period_start, action, language, personality, status
    ) values (
      p_shop_id, p_seller_id, v_period, 'reply_draft', p_language, p_personality, 'success'
    );

    return jsonb_build_object('ok', true, 'reply_count', v_count, 'limit', -1, 'period_start', v_period);
  end if;

  if p_limit is null or p_limit < 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_limit');
  end if;

  insert into public.ai_usage_monthly (shop_id, period_start, reply_count, guide_count)
  values (p_shop_id, v_period, 0, 0)
  on conflict (shop_id, period_start) do nothing;

  select id, reply_count into v_usage_id, v_count
  from public.ai_usage_monthly
  where shop_id = p_shop_id and period_start = v_period
  for update;

  if v_count >= p_limit then
    return jsonb_build_object(
      'ok', false, 'error', 'quota_exceeded',
      'reply_count', v_count, 'limit', p_limit, 'period_start', v_period
    );
  end if;

  update public.ai_usage_monthly
  set reply_count = reply_count + 1, updated_at = now()
  where id = v_usage_id
  returning reply_count into v_count;

  insert into public.ai_reply_events (
    shop_id, seller_id, usage_period_start, action, language, personality, status
  ) values (
    p_shop_id, p_seller_id, v_period, 'reply_draft', p_language, p_personality, 'success'
  );

  return jsonb_build_object('ok', true, 'reply_count', v_count, 'limit', p_limit, 'period_start', v_period);
end;
$$;

revoke all on function public.consume_ai_reply_quota(uuid, uuid, int, text, text) from public;
grant execute on function public.consume_ai_reply_quota(uuid, uuid, int, text, text) to service_role;

create or replace function public.record_ai_event(
  p_shop_id uuid,
  p_seller_id uuid,
  p_action text,
  p_status text,
  p_language text default null,
  p_personality text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period date;
begin
  if p_action not in ('reply_draft', 'guide') then raise exception 'invalid action'; end if;
  if p_status not in ('success', 'failed') then raise exception 'invalid status'; end if;

  v_period := date_trunc('month', (timezone('Africa/Lagos', now()))::date)::date;

  if p_action = 'guide' and p_status = 'success' then
    insert into public.ai_usage_monthly (shop_id, period_start, reply_count, guide_count)
    values (p_shop_id, v_period, 0, 1)
    on conflict (shop_id, period_start) do update
      set guide_count = public.ai_usage_monthly.guide_count + 1, updated_at = now();
  end if;

  insert into public.ai_reply_events (
    shop_id, seller_id, usage_period_start, action, language, personality, status
  ) values (
    p_shop_id, p_seller_id, v_period, p_action, p_language, p_personality, p_status
  );
end;
$$;

revoke all on function public.record_ai_event(uuid, uuid, text, text, text, text) from public;
grant execute on function public.record_ai_event(uuid, uuid, text, text, text, text) to service_role;
