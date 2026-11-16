import { createClient } from "@/lib/supabase/server";
import type { VerificationApplication, VerificationDocument } from "./types";

export async function listSellerVerifications(
  sellerId: string
): Promise<{ data: VerificationApplication[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("provider_verifications")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as VerificationApplication[], error: null };
}

export async function listVerificationDocuments(
  verificationId: string
): Promise<{ data: VerificationDocument[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("provider_documents")
    .select("*")
    .eq("verification_id", verificationId)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as VerificationDocument[], error: null };
}

export async function listOfficerQueue(limit = 50): Promise<{
  data: (VerificationApplication & {
    seller_profiles?: { business_name: string; slug: string } | null;
  })[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("provider_verifications")
    .select(
      `
      *,
      seller_profiles ( business_name, slug )
    `
    )
    .in("status", ["submitted", "under_review", "additional_info_required"])
    .order("submitted_at", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []) as never, error: null };
}
