export type VerificationLevel = "basic" | "identity" | "business" | "professional";

export type VerificationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "additional_info_required"
  | "approved"
  | "rejected";

export type VerificationApplication = {
  id: string;
  seller_id: string;
  level: VerificationLevel;
  status: VerificationStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  decision_notes: string | null;
  rejection_reason: string | null;
  additional_info_request: string | null;
  created_at: string;
  updated_at: string;
};

export type VerificationDocument = {
  id: string;
  verification_id: string;
  seller_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_by: string;
  created_at: string;
};

export const ALLOWED_DOC_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MiB

export const LEVEL_LABELS: Record<VerificationLevel, string> = {
  basic: "Basic account",
  identity: "Identity",
  business: "Business",
  professional: "Professional / qualification",
};

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  additional_info_required: "More information required",
  approved: "Approved",
  rejected: "Rejected",
};
