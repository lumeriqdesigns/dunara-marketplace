"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";
import {
  initializeTransaction,
  verifyTransaction,
} from "@/lib/paystack/client";
import {
  activatePaidSubscription,
  expireTrials,
} from "./lib/subscription-service";
import { randomUUID } from "crypto";

export type BillingActionState = {
  ok: boolean;
  message?: string;
};

/**
 * Start Paystack checkout for a paid plan (pulse_monthly, pulse_annual, apex_*).
 */
export async function startCheckoutAction(
  _prev: BillingActionState,
  formData: FormData
): Promise<BillingActionState> {
  const user = await requireUser("/seller/billing");
  const shop = await getOwnShop(user.id);
  if (!shop) {
    return { ok: false, message: "Create a shop before subscribing." };
  }

  const planSlug = String(formData.get("planSlug") ?? "");
  if (!planSlug || planSlug === "open") {
    return { ok: false, message: "Select a paid plan." };
  }

  await expireTrials();

  const supabase = await createClient();
  const { data: plan } = await supabase
    .from("plans")
    .select("*")
    .eq("slug", planSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!plan || plan.price_kobo <= 0) {
    return { ok: false, message: "Plan not available." };
  }

  const siteUrl = await getSiteUrl();
  const reference = `dunara_${shop.id.slice(0, 8)}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;

  // Store pending intent metadata in payment_events for audit (optional ref key)
  try {
    const admin = createAdminClient();
    await admin.from("payment_events").insert({
      event_type: "checkout.initialized",
      paystack_event_id: `init_${reference}`,
      payload: {
        shop_id: shop.id,
        plan_id: plan.id,
        plan_slug: plan.slug,
        amount_kobo: plan.price_kobo,
        reference,
      },
      processed: true,
    });
  } catch {
    // non-fatal
  }

  let init;
  try {
    init = await initializeTransaction({
      email: user.email ?? `${shop.id}@sellers.dunara.local`,
      amountKobo: Number(plan.price_kobo),
      reference,
      callbackUrl: `${siteUrl}/seller/billing/callback`,
      planCode: plan.paystack_plan_code,
      metadata: {
        shop_id: shop.id,
        plan_id: plan.id,
        plan_slug: plan.slug,
        billing_interval: plan.interval === "annual" ? "annual" : "monthly",
        custom_fields: [
          { display_name: "Shop", variable_name: "shop_slug", value: shop.slug },
        ],
      },
    });
  } catch (e) {
    console.error("Paystack initialize error:", e);
    return {
      ok: false,
      message: "Could not start checkout. Check Paystack configuration.",
    };
  }

  if (!init.status || !init.data?.authorization_url) {
    return {
      ok: false,
      message: init.message || "Paystack rejected the checkout request.",
    };
  }

  redirect(init.data.authorization_url);
}

/**
 * Server-side verification after Paystack redirect.
 * Never trust the redirect alone — always verify with Paystack API.
 */
export async function confirmPaymentReference(
  reference: string
): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser("/seller/billing");
  const shop = await getOwnShop(user.id);
  if (!shop) return { ok: false, message: "No shop." };

  let verified;
  try {
    verified = await verifyTransaction(reference);
  } catch (e) {
    console.error("verifyTransaction:", e);
    return { ok: false, message: "Could not verify payment with Paystack." };
  }

  if (!verified.status || verified.data?.status !== "success") {
    return { ok: false, message: "Payment was not successful." };
  }

  if (verified.data.currency && verified.data.currency !== "NGN") {
    return { ok: false, message: "Unexpected currency." };
  }

  const meta = (verified.data.metadata ?? {}) as {
    shop_id?: string;
    plan_id?: string;
    plan_slug?: string;
    billing_interval?: string;
  };

  if (meta.shop_id && meta.shop_id !== shop.id) {
    return { ok: false, message: "Payment does not match your shop." };
  }

  const admin = createAdminClient();

  // Idempotency: skip if we already processed this reference
  const eventId = `verify_${reference}`;
  const { data: existingEvent } = await admin
    .from("payment_events")
    .select("id, processed")
    .eq("paystack_event_id", eventId)
    .maybeSingle();

  if (existingEvent?.processed) {
    return { ok: true, message: "Subscription already activated." };
  }

  await admin.from("payment_events").upsert(
    {
      event_type: "transaction.verify",
      paystack_event_id: eventId,
      payload: verified.data as object,
      processed: false,
    },
    { onConflict: "paystack_event_id" }
  );

  // Resolve plan
  let planId = meta.plan_id;
  if (!planId && meta.plan_slug) {
    const { data: p } = await admin
      .from("plans")
      .select("id")
      .eq("slug", meta.plan_slug)
      .maybeSingle();
    planId = p?.id;
  }
  if (!planId) {
    return { ok: false, message: "Could not resolve plan from payment." };
  }

  const { data: plan } = await admin
    .from("plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();

  if (!plan) return { ok: false, message: "Plan not found." };

  // Amount check (allow plan amount)
  if (
    verified.data.amount != null &&
    Number(verified.data.amount) !== Number(plan.price_kobo)
  ) {
    console.error("Amount mismatch", verified.data.amount, plan.price_kobo);
    return { ok: false, message: "Payment amount does not match plan price." };
  }

  const interval =
    plan.interval === "annual"
      ? "annual"
      : ("monthly" as "monthly" | "annual");

  await activatePaidSubscription({
    shopId: shop.id,
    planId: plan.id,
    billingInterval: interval,
    paystackCustomerCode: verified.data.customer?.customer_code ?? null,
  });

  await admin
    .from("payment_events")
    .update({ processed: true })
    .eq("paystack_event_id", eventId);

  revalidatePath("/seller/billing");
  revalidatePath("/seller");
  return { ok: true, message: "Subscription activated." };
}
