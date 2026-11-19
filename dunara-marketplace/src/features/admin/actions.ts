"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/features/admin/lib/require-admin";
import type { AdminAuditLog, Listing, Shop, Subscription, VerificationRequest } from "@/types";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string };

const uuidSchema = z.string().uuid();
const reasonSchema = z.string().trim().min(3).max(500);
const pageSchema = z.number().int().min(1).max(1000).default(1);
const pageSizeSchema = z.number().int().min(1).max(50).default(20);

export type AdminOverview = {
  totalShops: number;
  publishedListings: number;
  pendingVerifications: number;
  activePaidSubscriptions: number;
  recentShops: Array<{
    id: string;
    name: string;
    slug: string;
    created_at: string;
    is_published: boolean;
    is_suspended: boolean;
  }>;
  recentAudit: Array<{
    id: string;
    action: string;
    target_type: string;
    target_id: string;
    reason: string | null;
    created_at: string;
  }>;
};

export async function getAdminOverview(): Promise<ActionResult<AdminOverview>> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();

  const [
    shopsCount,
    listingsCount,
    pendingVerifs,
    activeSubs,
    recentShops,
    recentAudit,
  ] = await Promise.all([
    supabase.from("shops").select("id", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "trialing", "past_due"]),
    supabase
      .from("shops")
      .select("id, name, slug, created_at, is_published, is_suspended")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("admin_audit_logs")
      .select("id, action, target_type, target_id, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    ok: true,
    data: {
      totalShops: shopsCount.count ?? 0,
      publishedListings: listingsCount.count ?? 0,
      pendingVerifications: pendingVerifs.count ?? 0,
      activePaidSubscriptions: activeSubs.count ?? 0,
      recentShops: (recentShops.data ?? []) as AdminOverview["recentShops"],
      recentAudit: (recentAudit.data ?? []) as AdminOverview["recentAudit"],
    },
  };
}

export type ShopSearchFilters = {
  q?: string;
  published?: "all" | "yes" | "no";
  suspended?: "all" | "yes" | "no";
  verification?: "all" | "none" | "pending" | "verified" | "rejected";
  page?: number;
  pageSize?: number;
};

export type AdminShopRow = {
  id: string;
  name: string;
  slug: string;
  is_published: boolean;
  is_suspended: boolean;
  verification_status: string;
  created_at: string;
  owner_email: string | null;
  plan_slug: string | null;
  subscription_status: string | null;
};

export async function searchAdminShops(
  filters: ShopSearchFilters = {}
): Promise<ActionResult<{ rows: AdminShopRow[]; total: number; page: number; pageSize: number }>> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const page = pageSchema.parse(filters.page ?? 1);
  const pageSize = pageSizeSchema.parse(filters.pageSize ?? 20);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  let query = supabase
    .from("shops")
    .select(
      "id, name, slug, is_published, is_suspended, verification_status, created_at, owner_id, profiles(email), subscriptions(status, plans(slug))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }
  if (filters.published === "yes") query = query.eq("is_published", true);
  if (filters.published === "no") query = query.eq("is_published", false);
  if (filters.suspended === "yes") query = query.eq("is_suspended", true);
  if (filters.suspended === "no") query = query.eq("is_suspended", false);
  if (filters.verification && filters.verification !== "all") {
    query = query.eq("verification_status", filters.verification);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("searchAdminShops:", error.message);
    return { ok: false, message: "Could not load shops." };
  }

  const rows: AdminShopRow[] = (data ?? []).map((row: Record<string, unknown>) => {
    const profiles = row.profiles as { email?: string } | null;
    const subs = row.subscriptions as
      | { status?: string; plans?: { slug?: string } | null }
      | { status?: string; plans?: { slug?: string } | null }[]
      | null;
    const sub = Array.isArray(subs) ? subs[0] : subs;
    return {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      is_published: Boolean(row.is_published),
      is_suspended: Boolean(row.is_suspended),
      verification_status: row.verification_status as string,
      created_at: row.created_at as string,
      owner_email: profiles?.email ?? null,
      plan_slug: sub?.plans?.slug ?? null,
      subscription_status: sub?.status ?? null,
    };
  });

  return { ok: true, data: { rows, total: count ?? 0, page, pageSize } };
}

export type AdminShopDetail = {
  shop: Shop;
  owner: { id: string; email: string | null; full_name: string | null } | null;
  subscription: (Subscription & { plans?: { name: string; slug: string } | null }) | null;
  listings: Array<Pick<Listing, "id" | "title" | "slug" | "is_published" | "listing_type" | "created_at">>;
  verifications: Array<
    Pick<VerificationRequest, "id" | "status" | "priority" | "created_at" | "reviewed_at" | "rejection_reason">
  >;
};

export async function getAdminShopDetail(
  shopId: string
): Promise<ActionResult<AdminShopDetail>> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const id = uuidSchema.safeParse(shopId);
  if (!id.success) return { ok: false, message: "Invalid shop id." };

  const supabase = await createClient();
  const { data: shop, error } = await supabase
    .from("shops")
    .select("*")
    .eq("id", id.data)
    .maybeSingle();

  if (error || !shop) return { ok: false, message: "Shop not found." };

  const [{ data: owner }, { data: subscription }, { data: listings }, { data: verifications }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", shop.owner_id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*, plans(name, slug)")
        .eq("shop_id", shop.id)
        .maybeSingle(),
      supabase
        .from("listings")
        .select("id, title, slug, is_published, listing_type, created_at")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("verification_requests")
        .select("id, status, priority, created_at, reviewed_at, rejection_reason")
        .eq("shop_id", shop.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  return {
    ok: true,
    data: {
      shop: shop as Shop,
      owner: owner as AdminShopDetail["owner"],
      subscription: subscription as AdminShopDetail["subscription"],
      listings: (listings ?? []) as AdminShopDetail["listings"],
      verifications: (verifications ?? []) as AdminShopDetail["verifications"],
    },
  };
}

export async function setShopSuspension(
  shopId: string,
  suspended: boolean,
  reason: string
): Promise<ActionResult> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const id = uuidSchema.safeParse(shopId);
  if (!id.success) return { ok: false, message: "Invalid shop id." };
  const r = reasonSchema.safeParse(reason);
  if (!r.success) return { ok: false, message: "Reason must be 3–500 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_set_shop_suspension", {
    p_shop_id: id.data,
    p_suspended: suspended,
    p_reason: r.data,
  });

  if (error) {
    console.error("setShopSuspension:", error.message);
    return { ok: false, message: "Could not update shop suspension." };
  }

  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) {
    if (result?.error === "forbidden") return { ok: false, message: "Admin access required." };
    if (result?.error === "not_found") return { ok: false, message: "Shop not found." };
    if (result?.error === "invalid_reason") return { ok: false, message: "Invalid reason." };
    return { ok: false, message: "Could not update shop suspension." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath(`/admin/shops/${id.data}`);
  revalidatePath("/explore");
  return {
    ok: true,
    message: suspended ? "Shop suspended." : "Shop restored.",
  };
}

export type ListingSearchFilters = {
  q?: string;
  published?: "all" | "yes" | "no";
  page?: number;
  pageSize?: number;
};

export type AdminListingRow = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  listing_type: string;
  created_at: string;
  shop_id: string;
  shop_name: string | null;
  shop_slug: string | null;
};

export async function searchAdminListings(
  filters: ListingSearchFilters = {}
): Promise<
  ActionResult<{ rows: AdminListingRow[]; total: number; page: number; pageSize: number }>
> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const page = pageSchema.parse(filters.page ?? 1);
  const pageSize = pageSizeSchema.parse(filters.pageSize ?? 20);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      "id, title, slug, is_published, listing_type, created_at, shop_id, shops(name, slug)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    query = query.ilike("title", `%${q}%`);
  }
  if (filters.published === "yes") query = query.eq("is_published", true);
  if (filters.published === "no") query = query.eq("is_published", false);

  const { data, error, count } = await query;
  if (error) {
    console.error("searchAdminListings:", error.message);
    return { ok: false, message: "Could not load listings." };
  }

  const rows: AdminListingRow[] = (data ?? []).map((row: Record<string, unknown>) => {
    const shops = row.shops as { name?: string; slug?: string } | null;
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      is_published: Boolean(row.is_published),
      listing_type: row.listing_type as string,
      created_at: row.created_at as string,
      shop_id: row.shop_id as string,
      shop_name: shops?.name ?? null,
      shop_slug: shops?.slug ?? null,
    };
  });

  return { ok: true, data: { rows, total: count ?? 0, page, pageSize } };
}

export async function setListingPublished(
  listingId: string,
  published: boolean,
  reason: string
): Promise<ActionResult> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const id = uuidSchema.safeParse(listingId);
  if (!id.success) return { ok: false, message: "Invalid listing id." };
  const r = reasonSchema.safeParse(reason);
  if (!r.success) return { ok: false, message: "Reason must be 3–500 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_set_listing_published", {
    p_listing_id: id.data,
    p_published: published,
    p_reason: r.data,
  });

  if (error) {
    console.error("setListingPublished:", error.message);
    return { ok: false, message: "Could not update listing." };
  }

  const result = data as { ok?: boolean; error?: string } | null;
  if (!result?.ok) {
    if (result?.error === "forbidden") return { ok: false, message: "Admin access required." };
    if (result?.error === "not_found") return { ok: false, message: "Listing not found." };
    return { ok: false, message: "Could not update listing." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/listings");
  revalidatePath("/explore");
  return {
    ok: true,
    message: published ? "Listing published." : "Listing unpublished.",
  };
}

export type SubscriptionHealth = {
  counts: {
    trialing: number;
    active: number;
    past_due: number;
    cancelled: number;
    free: number;
  };
  rows: Array<{
    id: string;
    status: string;
    billing_interval: string | null;
    trial_ends_at: string | null;
    current_period_end: string | null;
    shop_id: string;
    shop_name: string | null;
    plan_name: string | null;
    plan_slug: string | null;
  }>;
};

export async function getAdminSubscriptionHealth(): Promise<ActionResult<SubscriptionHealth>> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const statuses = ["trialing", "active", "past_due", "cancelled", "free"] as const;

  const countResults = await Promise.all(
    statuses.map((s) =>
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", s)
    )
  );

  const { data: rows, error } = await supabase
    .from("subscriptions")
    .select(
      "id, status, billing_interval, trial_ends_at, current_period_end, shop_id, shops(name), plans(name, slug)"
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("getAdminSubscriptionHealth:", error.message);
    return { ok: false, message: "Could not load subscriptions." };
  }

  const counts = {
    trialing: countResults[0].count ?? 0,
    active: countResults[1].count ?? 0,
    past_due: countResults[2].count ?? 0,
    cancelled: countResults[3].count ?? 0,
    free: countResults[4].count ?? 0,
  };

  const mapped = (rows ?? []).map((row: Record<string, unknown>) => {
    const shops = row.shops as { name?: string } | null;
    const plans = row.plans as { name?: string; slug?: string } | null;
    return {
      id: row.id as string,
      status: row.status as string,
      billing_interval: row.billing_interval as string | null,
      trial_ends_at: row.trial_ends_at as string | null,
      current_period_end: row.current_period_end as string | null,
      shop_id: row.shop_id as string,
      shop_name: shops?.name ?? null,
      plan_name: plans?.name ?? null,
      plan_slug: plans?.slug ?? null,
    };
  });

  return { ok: true, data: { counts, rows: mapped } };
}

export async function getAdminAuditLogs(page = 1): Promise<
  ActionResult<{ rows: AdminAuditLog[]; page: number }>
> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const p = pageSchema.parse(page);
  const pageSize = 30;
  const from = (p - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getAdminAuditLogs:", error.message);
    return { ok: false, message: "Could not load audit logs." };
  }

  return { ok: true, data: { rows: (data ?? []) as AdminAuditLog[], page: p } };
}

/** Pending verification queue summary for Module 10 navigation (full review in Module 11). */
export async function getAdminVerificationQueueSummary(): Promise<
  ActionResult<{
    pendingCount: number;
    rows: Array<{
      id: string;
      status: string;
      priority: boolean;
      created_at: string;
      shop_id: string;
      shop_name: string | null;
      plan_slug_at_submission: string | null;
    }>;
  }>
> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await createClient();
  const [{ count }, { data, error }] = await Promise.all([
    supabase
      .from("verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("verification_requests")
      .select(
        "id, status, priority, created_at, shop_id, plan_slug_at_submission, shops(name)"
      )
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(50),
  ]);

  if (error) {
    console.error("getAdminVerificationQueueSummary:", error.message);
    return { ok: false, message: "Could not load verification queue." };
  }

  const rows = (data ?? []).map((row: Record<string, unknown>) => {
    const shops = row.shops as { name?: string } | null;
    return {
      id: row.id as string,
      status: row.status as string,
      priority: Boolean(row.priority),
      created_at: row.created_at as string,
      shop_id: row.shop_id as string,
      shop_name: shops?.name ?? null,
      plan_slug_at_submission: row.plan_slug_at_submission as string | null,
    };
  });

  return { ok: true, data: { pendingCount: count ?? 0, rows } };
}
