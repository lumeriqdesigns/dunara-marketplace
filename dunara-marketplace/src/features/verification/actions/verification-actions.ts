"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/permissions";
import {
  ALLOWED_DOC_MIME,
  MAX_DOC_BYTES,
  type VerificationLevel,
} from "@/features/verification/lib/types";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
  id?: string;
  signedUrl?: string;
};

async function requireAuth() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

async function requireOwnSeller() {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("seller_profiles")
    .select("id, user_id, is_verified, verification_level")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) throw new Error("Seller profile required");
  return { user, profile, supabase };
}

async function requireOfficer() {
  const user = await requireAuth();
  // Match RPC: only verification_officer or super_admin (not support/moderator via isAdmin)
  if (!hasRole(user, "verification_officer") && !hasRole(user, "super_admin")) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Create or get a draft application, then mark submitted.
 */
export async function submitVerificationApplication(
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireOwnSeller();
    const level = String(formData.get("level") ?? "basic").trim() as VerificationLevel;
    const allowed: VerificationLevel[] = ["basic", "identity", "business", "professional"];
    if (!allowed.includes(level)) {
      return { ok: false, error: "Invalid verification level." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("verification_seller_submit", {
      p_level: level,
    });

    if (error) return { ok: false, error: error.message };

    const row = data as { id?: string } | null;
    revalidatePath("/seller/verification");
    revalidatePath("/admin/verification");
    return {
      ok: true,
      message:
        "Application submitted. An officer will review it. Dúnarà does not guarantee identity beyond the checks performed.",
      id: row?.id,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not submit application.",
    };
  }
}

/**
 * Upload a private verification document for an owned application.
 */
export async function uploadVerificationDocument(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { user, profile, supabase } = await requireOwnSeller();
    const verificationId = String(formData.get("verification_id") ?? "").trim();
    const documentType = String(formData.get("document_type") ?? "identity").trim().slice(0, 80);
    const file = formData.get("file") as File | null;

    if (!verificationId) return { ok: false, error: "Application is required." };
    if (!file || file.size === 0) return { ok: false, error: "File is required." };
    if (file.size > MAX_DOC_BYTES) {
      return { ok: false, error: "File must be 10 MB or smaller." };
    }
    if (!ALLOWED_DOC_MIME.includes(file.type as (typeof ALLOWED_DOC_MIME)[number])) {
      return { ok: false, error: "Only PDF, JPEG, PNG, or WebP files are allowed." };
    }

    const { data: app } = await supabase
      .from("provider_verifications")
      .select("id, seller_id, status")
      .eq("id", verificationId)
      .eq("seller_id", profile.id)
      .maybeSingle();

    if (!app) return { ok: false, error: "Application not found." };
    if (!["draft", "submitted", "additional_info_required"].includes(app.status)) {
      return { ok: false, error: "Documents cannot be added in the current status." };
    }

    const ext =
      file.type === "application/pdf"
        ? "pdf"
        : file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";
    const path = `${user.id}/${verificationId}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("verification-documents")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (upErr) return { ok: false, error: upErr.message };

    const { error: insErr } = await supabase.from("provider_documents").insert({
      verification_id: verificationId,
      seller_id: profile.id,
      document_type: documentType,
      file_path: path,
      file_name: file.name.slice(0, 200),
      mime_type: file.type,
      file_size_bytes: file.size,
      uploaded_by: user.id,
    });

    if (insErr) {
      await supabase.storage.from("verification-documents").remove([path]);
      return { ok: false, error: insErr.message };
    }

    revalidatePath("/seller/verification");
    return { ok: true, message: "Document uploaded securely." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not upload document.",
    };
  }
}

/**
 * Seller resubmits after additional_info_required.
 */
export async function resubmitVerification(
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireOwnSeller();
    const verificationId = String(formData.get("verification_id") ?? "").trim();
    if (!verificationId) return { ok: false, error: "Application is required." };
    const supabase = await createClient();
    const { error } = await supabase.rpc("verification_seller_resubmit", {
      p_verification_id: verificationId,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/seller/verification");
    revalidatePath("/admin/verification");
    return {
      ok: true,
      message: "Application resubmitted for review. Include any requested documents.",
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not resubmit.",
    };
  }
}

/**
 * Short-lived signed URL for a document the caller may access.
 */
export async function getVerificationDocumentUrl(
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAuth();
    const documentId = String(formData.get("document_id") ?? "").trim();
    if (!documentId) return { ok: false, error: "Document is required." };

    const supabase = await createClient();
    // RLS restricts SELECT to owner or officer — membership check before sign
    const { data: doc, error } = await supabase
      .from("provider_documents")
      .select("id, file_path")
      .eq("id", documentId)
      .maybeSingle();

    if (error || !doc) return { ok: false, error: "Document not found." };

    const { data: signed, error: sErr } = await supabase.storage
      .from("verification-documents")
      .createSignedUrl(doc.file_path, 60 * 5); // 5 minutes

    if (sErr || !signed?.signedUrl) {
      return { ok: false, error: sErr?.message ?? "Could not sign URL." };
    }
    return { ok: true, signedUrl: signed.signedUrl, message: signed.signedUrl };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not get document link.",
    };
  }
}

/**
 * Officer decision: approve | reject | request_info | under_review
 */
export async function officerDecideVerification(
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireOfficer();
    const verificationId = String(formData.get("verification_id") ?? "").trim();
    const decision = String(formData.get("decision") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim() || null;
    const rejectionReason = String(formData.get("rejection_reason") ?? "").trim() || null;
    const additionalInfo = String(formData.get("additional_info_request") ?? "").trim() || null;

    if (!verificationId) return { ok: false, error: "Application is required." };
    if (!["approve", "reject", "request_info", "under_review"].includes(decision)) {
      return { ok: false, error: "Invalid decision." };
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("verification_officer_decide", {
      p_verification_id: verificationId,
      p_decision: decision,
      p_notes: notes,
      p_rejection_reason: rejectionReason,
      p_additional_info_request: additionalInfo,
    });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin/verification");
    revalidatePath("/seller/verification");
    return { ok: true, message: `Decision recorded: ${decision}.` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Decision failed.";
    if (msg === "FORBIDDEN") return { ok: false, error: "Officer access required." };
    return { ok: false, error: msg };
  }
}
