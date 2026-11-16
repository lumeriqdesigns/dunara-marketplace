import { createClient } from "@/lib/supabase/server";

export type OverviewStats = {
  users: number;
  sellers: number;
  publishedListings: number;
  openBookings: number;
  openReports: number;
  pendingVerifications: number;
};

export async function getOverviewStats(): Promise<{
  data: OverviewStats;
  error: string | null;
}> {
  const empty: OverviewStats = {
    users: 0,
    sellers: 0,
    publishedListings: 0,
    openBookings: 0,
    openReports: 0,
    pendingVerifications: 0
  };
  try {
    const supabase = await createClient();
    const [
      users,
      sellers,
      listings,
      bookings,
      reports,
      verifications
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("seller_profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("service_listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("status", [
          "requested",
          "quoted",
          "accepted",
          "awaiting_confirmation",
          "confirmed",
          "in_progress"
        ]),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "under_review"]),
      supabase
        .from("provider_verifications")
        .select("id", { count: "exact", head: true })
        .in("status", ["submitted", "under_review", "additional_info_required"])
    ]);

    return {
      data: {
        users: users.count ?? 0,
        sellers: sellers.count ?? 0,
        publishedListings: listings.count ?? 0,
        openBookings: bookings.count ?? 0,
        openReports: reports.count ?? 0,
        pendingVerifications: verifications.count ?? 0
      },
      error: null
    };
  } catch (e) {
    return {
      data: empty,
      error: e instanceof Error ? e.message : "Failed to load overview"
    };
  }
}

/** Public-safe user row for admin lists — no password; email only for staff who need it */
export type AdminUserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
  roles: string[];
};

export async function getAdminUsers(limit = 50): Promise<{
  data: AdminUserRow[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, display_name, is_active, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return { data: [], error: error.message };

    const ids = (profiles ?? []).map((p) => p.id);
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])
      .eq("is_active", true)
      .is("revoked_at", null);

    const byUser = new Map<string, string[]>();
    for (const r of roleRows ?? []) {
      const list = byUser.get(r.user_id) ?? [];
      list.push(r.role);
      byUser.set(r.user_id, list);
    }

    return {
      data: (profiles ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        is_active: p.is_active,
        created_at: p.created_at,
        roles: byUser.get(p.id) ?? []
      })),
      error: null
    };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load users"
    };
  }
}

export type AdminSellerRow = {
  id: string;
  business_name: string;
  slug: string;
  is_verified: boolean;
  verification_level: string | null;
  is_active: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
};

export async function getAdminSellers(limit = 50) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("seller_profiles")
      .select(
        `id, business_name, slug, is_verified, verification_level,
         is_active, average_rating, review_count, created_at`
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { data: [] as AdminSellerRow[], error: error.message };
    return {
      data: (data ?? []) as AdminSellerRow[],
      error: null
    };
  } catch (e) {
    return {
      data: [] as AdminSellerRow[],
      error: e instanceof Error ? e.message : "Failed to load sellers"
    };
  }
}

export type AdminListingRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  seller?: { business_name: string; slug: string } | null;
  category?: { name: string } | null;
};

export async function getAdminListings(limit = 50) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_listings")
      .select(
        `
        id, title, slug, status, created_at,
        seller:seller_profiles ( business_name, slug ),
        category:categories ( name )
      `
      )
      .order("updated_at", { ascending: false })
      .limit(limit);
    if (error) return { data: [] as AdminListingRow[], error: error.message };
    return { data: (data ?? []) as unknown as AdminListingRow[], error: null };
  } catch (e) {
    return {
      data: [] as AdminListingRow[],
      error: e instanceof Error ? e.message : "Failed to load listings"
    };
  }
}

export type AdminBookingRow = {
  id: string;
  reference_code: string;
  status: string;
  title: string | null;
  created_at: string;
  seller?: { business_name: string } | null;
};

export async function getAdminBookings(limit = 50) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id, reference_code, status, title, created_at,
        seller:seller_profiles ( business_name )
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { data: [] as AdminBookingRow[], error: error.message };
    return { data: (data ?? []) as unknown as AdminBookingRow[], error: null };
  } catch (e) {
    return {
      data: [] as AdminBookingRow[],
      error: e instanceof Error ? e.message : "Failed to load bookings"
    };
  }
}

export type AuditLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export async function getAuditLogs(limit = 100) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, actor_id, action, entity_type, entity_id, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { data: [] as AuditLogRow[], error: error.message };
    return { data: (data ?? []) as AuditLogRow[], error: null };
  } catch (e) {
    return {
      data: [] as AuditLogRow[],
      error: e instanceof Error ? e.message : "Failed to load audit logs"
    };
  }
}

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export async function getAdminCategories() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, is_active, sort_order")
      .order("sort_order", { ascending: true });
    if (error) return { data: [] as CategoryRow[], error: error.message };
    return { data: (data ?? []) as CategoryRow[], error: null };
  } catch (e) {
    return {
      data: [] as CategoryRow[],
      error: e instanceof Error ? e.message : "Failed to load categories"
    };
  }
}

export async function getPlatformSettings() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("platform_settings")
      .select("key, value, updated_at")
      .order("key");
    if (error) return { data: [] as { key: string; value: unknown; updated_at: string }[], error: error.message };
    return {
      data: (data ?? []) as { key: string; value: unknown; updated_at: string }[],
      error: null
    };
  } catch (e) {
    return {
      data: [] as { key: string; value: unknown; updated_at: string }[],
      error: e instanceof Error ? e.message : "Failed to load settings"
    };
  }
}
