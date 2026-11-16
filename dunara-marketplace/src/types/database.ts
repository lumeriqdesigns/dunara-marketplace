/**
 * Dúnarà Marketplace — Database types
 *
 * These are hand-written placeholder types for Phase 2.
 * After connecting a Supabase project and applying migrations, regenerate with:
 *
 *   npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 *
 * or via the Supabase CLI linked to the local project.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "buyer"
  | "seller"
  | "support"
  | "verification_officer"
  | "moderator"
  | "operations_manager"
  | "super_admin";

export type VerificationLevel = "basic" | "identity" | "business" | "professional";
export type VerificationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "additional_info_required"
  | "approved"
  | "rejected";

export type ListingStatus = "draft" | "published" | "archived" | "suspended";
export type BookingType = "direct" | "quotation";
export type BookingStatus =
  | "requested"
  | "quoted"
  | "accepted"
  | "awaiting_confirmation"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "declined"
  | "cancelled"
  | "disputed";

export type QuoteStatus = "pending" | "accepted" | "rejected" | "expired" | "withdrawn";
export type NotificationChannel = "in_app" | "email" | "push" | "telegram";
export type ReportStatus = "open" | "under_review" | "resolved" | "dismissed";
export type ReportTargetType = "listing" | "review" | "user" | "message" | "other";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          display_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_active: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          display_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_active?: boolean;
          last_seen_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      // Additional tables follow the same pattern.
      // Prefer regenerating from the live schema after migrations are applied.
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Enums: {
      user_role: UserRole;
      verification_level: VerificationLevel;
      verification_status: VerificationStatus;
      listing_status: ListingStatus;
      booking_type: BookingType;
      booking_status: BookingStatus;
      quote_status: QuoteStatus;
      notification_channel: NotificationChannel;
      report_status: ReportStatus;
      report_target_type: ReportTargetType;
    };
  };
}
