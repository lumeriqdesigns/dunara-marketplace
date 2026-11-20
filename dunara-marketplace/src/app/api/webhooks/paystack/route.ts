import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack/client";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  activatePaidSubscription,
  markPastDue,
  markSubscriptionCancelled,
} from "@/features/billing/lib/subscription-service";

export const runtime = "nodejs";

type PaystackEvent = {
  event: string;
  data: {
    reference?: string;
    id?: number | string;
    subscription_code?: string;
    customer?: { customer_code?: string; email?: string };
    amount?: number;
    currency?: string;
    status?: string;
    plan?: { plan_code?: string; name?: string };
    metadata?: {
      shop_id?: string;
      plan_id?: string;
      plan_slug?: string;
      billing_interval?: string;
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventKey =
    event.data?.reference ||
    event.data?.subscription_code ||
    String(event.data?.id ?? "") ||
    `${event.event}_${Date.now()}`;
  const paystackEventId = `${event.event}:${eventKey}`;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // Idempotent insert
  const { data: existing } = await admin
    .from("payment_events")
    .select("id, processed")
    .eq("paystack_event_id", paystackEventId)
    .maybeSingle();

  if (existing?.processed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (!existing) {
    const { error: insErr } = await admin.from("payment_events").insert({
      event_type: event.event,
      paystack_event_id: paystackEventId,
      payload: event as unknown as object,
      processed: false,
    });
    // Unique race
    if (insErr?.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  try {
    await processEvent(event, admin);
    await admin
      .from("payment_events")
      .update({ processed: true, processing_error: null })
      .eq("paystack_event_id", paystackEventId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "process error";
    console.error("webhook process:", msg);
    await admin
      .from("payment_events")
      .update({ processing_error: msg })
      .eq("paystack_event_id", paystackEventId);
    // Still 200 so Paystack does not infinite-retry poison payloads after logging
    return NextResponse.json({ received: true, error: msg });
  }

  return NextResponse.json({ received: true });
}

async function processEvent(
  event: PaystackEvent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any
) {
  const data = event.data;
  const meta = data.metadata ?? {};

  switch (event.event) {
    case "charge.success": {
      if (data.currency && data.currency !== "NGN") {
        throw new Error("Non-NGN currency");
      }
      const shopId = meta.shop_id;
      let planId = meta.plan_id;
      if (!shopId) {
        // Cannot map without metadata
        console.warn("charge.success without shop_id metadata");
        return;
      }
      if (!planId && meta.plan_slug) {
        const { data: p } = await admin
          .from("plans")
          .select("id, interval")
          .eq("slug", meta.plan_slug)
          .maybeSingle();
        planId = p?.id;
      }
      if (!planId && data.plan?.plan_code) {
        const { data: p } = await admin
          .from("plans")
          .select("id, interval")
          .eq("paystack_plan_code", data.plan.plan_code)
          .maybeSingle();
        planId = p?.id;
      }
      if (!planId) throw new Error("Cannot resolve plan for charge.success");

      const { data: plan } = await admin
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();

      if (data.amount != null && Number(data.amount) !== Number(plan.price_kobo)) {
        throw new Error("Amount mismatch");
      }

      await activatePaidSubscription({
        shopId,
        planId,
        billingInterval: plan.interval === "annual" ? "annual" : "monthly",
        paystackCustomerCode: data.customer?.customer_code ?? null,
        paystackSubscriptionCode: data.subscription_code ?? null,
      });
      break;
    }
    case "subscription.disable":
    case "subscription.not_renew": {
      // Find by subscription code
      if (data.subscription_code) {
        const { data: sub } = await admin
          .from("subscriptions")
          .select("shop_id")
          .eq("paystack_subscription_code", data.subscription_code)
          .maybeSingle();
        if (sub?.shop_id) await markSubscriptionCancelled(sub.shop_id);
      }
      break;
    }
    case "invoice.payment_failed":
    case "charge.failed": {
      if (meta.shop_id) await markPastDue(meta.shop_id);
      else if (data.subscription_code) {
        const { data: sub } = await admin
          .from("subscriptions")
          .select("shop_id")
          .eq("paystack_subscription_code", data.subscription_code)
          .maybeSingle();
        if (sub?.shop_id) await markPastDue(sub.shop_id);
      }
      break;
    }
    default:
      // acknowledged but no-op
      break;
  }
}
