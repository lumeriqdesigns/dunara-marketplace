"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getShopEntitlement } from "@/features/billing/lib/subscription-service";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "@/features/admin/lib/require-admin";
import {
  ALLOWED_MIME,
  EVIDENCE_HELP,
  MAX_FILE_BYTES,
  MAX_FILES,
  VERIFICATION_BUCKET,
  extensionForMime,
} from "@/features/verification/lib/constants";
import type { VerificationRequest, VerificationStatus } from "@/types";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { uploadTooLargeMessage } from "@/lib/upload-limits";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string };

export type SellerVerificationStatus = {
  shopStatus: VerificationStatus;
  verifiedAt: string | null;
  verificationNote: string | null;
  eligible: boolean;
  planSlug: string;
  planName: string;
  evidenceHelp: string;
  latest: Pick<
    VerificationRequest,
    | "id"
    | "status"
    | "priority"
    | "plan_slug_at_submission"
    | "seller_note"
    | "rejection_reason"
    | "created_at"
    | "reviewed_at"
  > | null;
  history: Array<
    Pick<
      VerificationRequest,
      "id" | "status" | "priority" | "created_at" | "reviewed_at" | "rejection_reason"
    >
  >;
  canSubmit: boolean;
};

export async function getSellerVerificationStatus(): Promise<
  ActionResult<SellerVerificationStatus>
> {
  const user = await requireUser("/seller/verification");
  const shop = await getOwnShop(user.id);
  if (!shop) {
    return { ok: false, message: "Create a shop before applying for verification." };
  }

  const entitlement = await getShopEntitlement(shop.id);
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from("verification_requests")
    .select(
      "id, status, priority, plan_slug_at_submission, seller_note, rejection_reason, created_at, reviewed_at"
    )
    .eq("shop_id", shop.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("getSellerVerificationStatus:", error.message);
    return { ok: false, message: "Could not load verification status." };
  }

  const history = (requests ?? []) as SellerVerificationStatus["history"];
  const latest = history[0]
    ? (requests![0] as SellerVerificationStatus["latest"])
    : null;

  const pending = history.some((r) => r.status === "pending");
  const verified = shop.verification_status === "verified";
  const eligible = entitlement.canApplyVerification;
  const canSubmit =
    eligible && !pending && !verified && shop.verification_status !== "pending";

  return {
    ok: true,
    data: {
      shopStatus: shop.verification_status,
      verifiedAt: shop.verified_at,
      verificationNote: shop.verification_note,
      eligible,
      planSlug: entitlement.planSlug,
      planName: entitlement.planName,
      evidenceHelp: EVIDENCE_HELP,
      latest,
      history,
      canSubmit,
    },
  };
}

export async function submitVerificationRequest(
  formData: FormData
): Promise<ActionResult<{ requestId: string }>> {
  const user = await requireUser("/seller/verification");
  const rl = rateLimit(`verify-submit:${user.id}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return { ok: false, message: `Too many verification attempts. Try again in ${rl.retryAfterSec}s.` };
  }
  const shop = await getOwnShop(user.id);
  if (!shop) {
    return { ok: false, message: "Create a shop first." };
  }

  // Server-side entitlement — never trust client plan name
  const entitlement = await getShopEntitlement(shop.id);
  if (!entitlement.canApplyVerification) {
    return {
      ok: false,
      message:
        "Verification is available on Pulse and Apex. Upgrade your plan to apply.",
    };
  }

  if (shop.verification_status === "verified") {
    return { ok: false, message: "Your shop is already verified." };
  }

  const supabase = await createClient();

  const { data: existingPending } = await supabase
    .from("verification_requests")
    .select("id")
    .eq("shop_id", shop.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existingPending) {
    return {
      ok: false,
      message: "You already have a pending verification request.",
    };
  }

  const sellerNoteRaw = formData.get("sellerNote");
  const sellerNote =
    typeof sellerNoteRaw === "string" && sellerNoteRaw.trim()
      ? sellerNoteRaw.trim().slice(0, 500)
      : null;

  const files = formData.getAll("documents").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { ok: false, message: "Upload at least one document (PDF, JPG, or PNG)." };
  }
  if (files.length > MAX_FILES) {
    return { ok: false, message: `Upload at most ${MAX_FILES} files.` };
  }

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, message: uploadTooLargeMessage("Each file") };
    }
    if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
      return { ok: false, message: "Only PDF, JPG, and PNG files are accepted." };
    }
    if (!extensionForMime(file.type)) {
      return { ok: false, message: "Unsupported file type." };
    }
  }

  const requestId = randomUUID();
  const priority = entitlement.priorityBoost === true || entitlement.planSlug === "apex";
  const planSlugAtSubmission =
    entitlement.planSlug === "apex"
      ? "apex"
      : entitlement.planSlug === "pulse"
        ? "pulse"
        : entitlement.planSlug;

  const uploadedPaths: string[] = [];

  try {
    for (const file of files) {
      const ext = extensionForMime(file.type)!;
      const objectPath = `${shop.id}/${requestId}/${randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(VERIFICATION_BUCKET)
        .upload(objectPath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) {
        console.error("verification upload:", uploadError.message);
        throw new Error("upload_failed");
      }
      uploadedPaths.push(objectPath);
    }

    const { error: insertError } = await supabase.from("verification_requests").insert({
      id: requestId,
      shop_id: shop.id,
      submitted_by: user.id,
      status: "pending",
      document_paths: uploadedPaths,
      priority,
      plan_slug_at_submission: planSlugAtSubmission,
      seller_note: sellerNote,
    });

    if (insertError) {
      console.error("verification insert:", insertError.message);
      throw new Error("insert_failed");
    }

    // Set shop pending — may require elevated path if trigger blocks verification_status
    // Use admin client only for the protected field after ownership verified
    const admin = createAdminClient();
    const { error: shopError } = await admin
      .from("shops")
      .update({
        verification_status: "pending",
        verification_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", shop.id)
      .eq("owner_id", user.id);

    if (shopError) {
      console.error("shop pending status:", shopError.message);
      // Request exists; admin can still review. Surface soft warning.
    }

    revalidatePath("/seller/verification");
    revalidatePath("/seller");
    revalidatePath("/admin/verifications");

    return {
      ok: true,
      data: { requestId },
      message: "Documents submitted. We will review your application.",
    };
  } catch {
    // Cleanup uploaded objects if DB insert failed
    if (uploadedPaths.length > 0) {
      try {
        await supabase.storage.from(VERIFICATION_BUCKET).remove(uploadedPaths);
      } catch (e) {
        console.error("verification cleanup failed:", e);
      }
    }
    return {
      ok: false,
      message:
        "Could not submit verification. Check that the private storage bucket exists and try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// Admin review operations
// ---------------------------------------------------------------------------

export type AdminVerificationDetail = {
  request: VerificationRequest;
  shop: {
    id: string;
    name: string;
    slug: string;
    verification_status: VerificationStatus;
    is_suspended: boolean;
    is_published: boolean;
  };
  owner: { id: string; email: string | null; full_name: string | null } | null;
  documents: Array<{ path: string; signedUrl: string; expiresIn: number }>;
};

export async function getAdminVerificationDetail(
  requestId: string
): Promise<ActionResult<AdminVerificationDetail>> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const id = z.string().uuid().safeParse(requestId);
  if (!id.success) return { ok: false, message: "Invalid request id." };

  const supabase = await createClient();
  const { data: request, error } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("id", id.data)
    .maybeSingle();

  if (error || !request) return { ok: false, message: "Request not found." };

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug, verification_status, is_suspended, is_published, owner_id")
    .eq("id", request.shop_id)
    .maybeSingle();

  let ownerRow: { id: string; email: string | null; full_name: string | null } | null = null;
  if (shop?.owner_id) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", shop.owner_id)
      .maybeSingle();
    ownerRow = data;
  }

  if (!shop) return { ok: false, message: "Shop not found for this request." };

  const paths = (request.document_paths as string[]) ?? [];
  const expiresIn = 120; // seconds — short-lived
  const documents: AdminVerificationDetail["documents"] = [];

  // Signed URLs via service role after admin check
  const adminClient = createAdminClient();
  for (const path of paths) {
    const { data, error: signError } = await adminClient.storage
      .from(VERIFICATION_BUCKET)
      .createSignedUrl(path, expiresIn);
    if (signError || !data?.signedUrl) {
      console.error("signed url:", signError?.message);
      continue;
    }
    documents.push({ path, signedUrl: data.signedUrl, expiresIn });
  }

  return {
    ok: true,
    data: {
      request: request as VerificationRequest,
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        verification_status: shop.verification_status as VerificationStatus,
        is_suspended: shop.is_suspended,
        is_published: shop.is_published,
      },
      owner: ownerRow as AdminVerificationDetail["owner"],
      documents,
    },
  };
}

export async function approveVerification(
  requestId: string
): Promise<ActionResult> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const id = z.string().uuid().safeParse(requestId);
  if (!id.success) return { ok: false, message: "Invalid request id." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_approve_verification", {
    p_request_id: id.data,
  });

  if (error) {
    console.error("approveVerification:", error.message);
    return { ok: false, message: "Could not approve verification." };
  }

  const result = data as { ok?: boolean; error?: string; shop_id?: string } | null;
  if (!result?.ok) {
    if (result?.error === "conflict") {
      return { ok: false, message: "This request was already reviewed. Refresh the page." };
    }
    if (result?.error === "forbidden") return { ok: false, message: "Admin access required." };
    if (result?.error === "not_found") return { ok: false, message: "Request not found." };
    return { ok: false, message: "Could not approve verification." };
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${id.data}`);
  revalidatePath("/admin");
  if (result.shop_id) {
    revalidatePath(`/admin/shops/${result.shop_id}`);
  }
  revalidatePath("/seller/verification");

  return { ok: true, message: "Verification approved. Badge will show on public pages." };
}

export async function rejectVerification(
  requestId: string,
  rejectionReason: string,
  adminNote?: string
): Promise<ActionResult> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const id = z.string().uuid().safeParse(requestId);
  if (!id.success) return { ok: false, message: "Invalid request id." };

  const reason = z.string().trim().min(3).max(1000).safeParse(rejectionReason);
  if (!reason.success) {
    return { ok: false, message: "Seller-facing rejection reason must be 3–1000 characters." };
  }

  const note =
    adminNote && adminNote.trim()
      ? adminNote.trim().slice(0, 1000)
      : null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_reject_verification", {
    p_request_id: id.data,
    p_rejection_reason: reason.data,
    p_admin_note: note,
  });

  if (error) {
    console.error("rejectVerification:", error.message);
    return { ok: false, message: "Could not reject verification." };
  }

  const result = data as { ok?: boolean; error?: string; shop_id?: string } | null;
  if (!result?.ok) {
    if (result?.error === "conflict") {
      return { ok: false, message: "This request was already reviewed. Refresh the page." };
    }
    if (result?.error === "invalid_reason") {
      return { ok: false, message: "Invalid rejection reason." };
    }
    if (result?.error === "forbidden") return { ok: false, message: "Admin access required." };
    return { ok: false, message: "Could not reject verification." };
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/verifications/${id.data}`);
  revalidatePath("/admin");
  if (result.shop_id) revalidatePath(`/admin/shops/${result.shop_id}`);
  revalidatePath("/seller/verification");

  return { ok: true, message: "Verification rejected. The seller can see the reason and resubmit." };
}
