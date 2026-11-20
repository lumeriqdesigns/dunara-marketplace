/**
 * Dunara database types (V3 foundation).
 * Hand-maintained until generated types from Supabase CLI are preferred.
 */

export type ShopType = "product" | "service" | "both";
export type ListingType = "product" | "service";
export type PriceType = "fixed" | "from" | "negotiable";
export type VerificationStatus = "none" | "pending" | "verified" | "rejected";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "free";
export type PlanInterval = "monthly" | "annual" | "none";
export type CategoryType = "product" | "service" | "both";
export type AiLanguage = "english" | "pidgin";
export type AiPersonality =
  | "professional"
  | "friendly"
  | "warm"
  | "persuasive"
  | "custom";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  bio: string | null;
  category_id: string | null;
  shop_type: ShopType;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  state: string | null;
  city: string | null;
  country: string;
  instagram: string | null;
  tiktok: string | null;
  facebook: string | null;
  twitter: string | null;
  website: string | null;
  is_published: boolean;
  is_suspended: boolean;
  suspended_at: string | null;
  suspension_reason: string | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  verification_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  shop_id: string;
  title: string;
  slug: string;
  description: string | null;
  price_kobo: number | null;
  price_type: PriceType;
  listing_type: ListingType;
  category_id: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListingMedia {
  id: string;
  listing_id: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  interval: PlanInterval;
  price_kobo: number;
  paystack_plan_code: string | null;
  listing_limit: number;
  featured: boolean;
  priority_boost: boolean;
  ai_reply_limit_monthly: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  shop_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_interval: "monthly" | "annual" | null;
  paystack_subscription_code: string | null;
  paystack_customer_code: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  shop_id: string;
  submitted_by: string | null;
  status: "pending" | "approved" | "rejected";
  document_paths: string[];
  priority: boolean;
  plan_slug_at_submission: string | null;
  seller_note: string | null;
  admin_note: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: string;
  event_type: string;
  paystack_event_id: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processing_error: string | null;
  created_at: string;
}

export interface AiAssistantSettings {
  id: string;
  shop_id: string;
  language: AiLanguage;
  personality: AiPersonality;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiUsageMonthly {
  id: string;
  shop_id: string;
  period_start: string;
  reply_count: number;
  guide_count: number;
  created_at: string;
  updated_at: string;
}

export interface AiReplyEvent {
  id: string;
  shop_id: string;
  seller_id: string;
  usage_period_start: string;
  action: "reply_draft" | "guide";
  language: string | null;
  personality: string | null;
  status: "success" | "failed";
  created_at: string;
}


export type AdminRole = "admin";
export type AdminAuditTargetType = "shop" | "listing" | "verification_request";

export interface UserRole {
  user_id: string;
  role: AdminRole;
  created_at: string;
  created_by: string | null;
}

export interface AdminAuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: AdminAuditTargetType;
  target_id: string;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
