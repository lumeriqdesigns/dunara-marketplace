"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasAnyRole, requireAdmin } from "@/lib/permissions";
import { mapClientError, logServerError } from "@/lib/security/errors";
import {
  checkRateLimitAsync,
  RateLimits
} from "@/lib/security/rate-limit";
import {
  canAccessSection,
  canModerateListings,
  canSuspendUsers
} from "@/features/admin/lib/access";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

const TRIAGE_STATUSES = ["under_review", "resolved", "dismissed"] as const;

async function enforceAdminRateLimit(userId: string): Promise<ActionResult | null> {
  const rl = await checkRateLimitAsync(
    `admin:action:${userId}`,
    RateLimits.adminAction.limit,
    RateLimits.adminAction.windowMs
  );
  if (!rl.ok) {
    return {
      ok: false,
      error: `Too many admin actions. Try again in ${rl.retryAfterSeconds}s.`
    };
  }
  return null;
}

export async function triageReport(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    requireAdmin(user);
    if (!canAccessSection(user, "reports")) {
      return { ok: false, error: "You do not have permission to triage reports." };
    }

    const limited = await enforceAdminRateLimit(user!.id);
    if (limited) return limited;

    const reportId = String(formData.get("report_id") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim() || null;

    if (!reportId) return { ok: false, error: "Missing report." };
    if (!TRIAGE_STATUSES.includes(status as (typeof TRIAGE_STATUSES)[number])) {
      return { ok: false, error: "Invalid status." };
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_triage_report", {
      p_report_id: reportId,
      p_status: status,
      p_notes: notes
    });

    if (error) {
      logServerError("triageReport", error);
      return { ok: false, error: mapClientError(error) };
    }

    revalidatePath("/admin/reports");
    return { ok: true, message: "Report updated." };
  } catch (e) {
    logServerError("triageReport", e);
    return { ok: false, error: mapClientError(e) };
  }
}

export async function suspendUser(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    requireAdmin(user);
    if (!canSuspendUsers(user)) {
      return { ok: false, error: "Only operations managers may suspend accounts." };
    }

    const limited = await enforceAdminRateLimit(user!.id);
    if (limited) return limited;

    const userId = String(formData.get("user_id") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim() || null;
    const active = formData.get("is_active") === "true";

    if (!userId) return { ok: false, error: "Missing user." };

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_user_active", {
      p_user_id: userId,
      p_is_active: active,
      p_reason: reason
    });

    if (error) {
      logServerError("suspendUser", error);
      return { ok: false, error: mapClientError(error) };
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/sellers");
    revalidatePath("/admin/listings");
    return {
      ok: true,
      message: active
        ? "User reinstated (listings remain suspended until republished)."
        : "User suspended; seller deactivated and published listings suspended."
    };
  } catch (e) {
    logServerError("suspendUser", e);
    return { ok: false, error: mapClientError(e) };
  }
}

export async function moderateListing(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    requireAdmin(user);
    if (!canModerateListings(user)) {
      return { ok: false, error: "Moderator permission required." };
    }

    const limited = await enforceAdminRateLimit(user!.id);
    if (limited) return limited;

    const listingId = String(formData.get("listing_id") ?? "").trim();
    const status = String(formData.get("status") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim() || null;

    if (!listingId) return { ok: false, error: "Missing listing." };
    if (!["published", "archived", "suspended", "draft"].includes(status)) {
      return { ok: false, error: "Invalid status." };
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_moderate_listing", {
      p_listing_id: listingId,
      p_status: status,
      p_notes: notes
    });

    if (error) {
      logServerError("moderateListing", error);
      return { ok: false, error: mapClientError(error) };
    }

    revalidatePath("/admin/listings");
    return { ok: true, message: "Listing updated." };
  } catch (e) {
    logServerError("moderateListing", e);
    return { ok: false, error: mapClientError(e) };
  }
}

export async function upsertCategory(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    requireAdmin(user);
    if (!canAccessSection(user, "categories")) {
      return { ok: false, error: "Permission denied." };
    }

    const limited = await enforceAdminRateLimit(user!.id);
    if (limited) return limited;

    const id = String(formData.get("id") ?? "").trim() || null;
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
    const description = String(formData.get("description") ?? "").trim() || null;
    const isActive = formData.get("is_active") !== "false";
    const sortOrder = Number(formData.get("sort_order") ?? 0) || 0;

    if (!id && (!name || !slug)) {
      return { ok: false, error: "Name and slug are required." };
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_upsert_category", {
      p_id: id,
      p_name: name || null,
      p_slug: slug || null,
      p_description: description,
      p_is_active: isActive,
      p_sort_order: sortOrder
    });

    if (error) {
      logServerError("upsertCategory", error);
      return { ok: false, error: mapClientError(error) };
    }

    revalidatePath("/admin/categories");
    return { ok: true, message: id ? "Category updated." : "Category created." };
  } catch (e) {
    logServerError("upsertCategory", e);
    return { ok: false, error: mapClientError(e) };
  }
}

export async function setPlatformSetting(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    requireAdmin(user);
    if (!hasAnyRole(user, ["super_admin"])) {
      return { ok: false, error: "super_admin only." };
    }

    const limited = await enforceAdminRateLimit(user!.id);
    if (limited) return limited;

    const key = String(formData.get("key") ?? "").trim();
    const valueRaw = String(formData.get("value") ?? "").trim();
    if (!key) return { ok: false, error: "Key required." };
    if (!/^[a-z][a-z0-9_]{1,63}$/i.test(key)) {
      return {
        ok: false,
        error: "Key must be snake_case letters/numbers (e.g. maintenance_mode)."
      };
    }

    let value: unknown = valueRaw;
    try {
      value = JSON.parse(valueRaw);
    } catch {
      value = { text: valueRaw };
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_platform_setting", {
      p_key: key.toLowerCase(),
      p_value: value
    });

    if (error) {
      logServerError("setPlatformSetting", error);
      return { ok: false, error: mapClientError(error) };
    }

    revalidatePath("/admin/settings");
    return { ok: true, message: "Setting saved." };
  } catch (e) {
    logServerError("setPlatformSetting", e);
    return { ok: false, error: mapClientError(e) };
  }
}
