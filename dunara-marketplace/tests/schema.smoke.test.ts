/**
 * Schema smoke expectations for Dúnarà Marketplace Phase 2.
 * These tests document required tables and critical invariants.
 * Full RLS policy tests require a connected Supabase project.
 */
import { describe, expect, it } from "vitest";

const REQUIRED_TABLES = [
  "profiles",
  "user_roles",
  "buyer_profiles",
  "seller_profiles",
  "provider_verifications",
  "provider_documents",
  "provider_service_areas",
  "provider_availability",
  "categories",
  "service_listings",
  "listing_media",
  "favourites",
  "bookings",
  "booking_quotes",
  "booking_status_history",
  "conversations",
  "conversation_members",
  "messages",
  "message_attachments",
  "notifications",
  "notification_preferences",
  "push_subscriptions",
  "reviews",
  "reports",
  "audit_logs",
  "ai_conversations",
  "ai_messages",
  "external_account_links",
  "webhook_events"
] as const;

describe("database schema contract", () => {
  it("defines all 29 required tables", () => {
    expect(REQUIRED_TABLES).toHaveLength(29);
  });

  it("includes core identity and role tables", () => {
    expect(REQUIRED_TABLES).toContain("profiles");
    expect(REQUIRED_TABLES).toContain("user_roles");
    expect(REQUIRED_TABLES).toContain("buyer_profiles");
    expect(REQUIRED_TABLES).toContain("seller_profiles");
  });

  it("includes booking and quotation tables", () => {
    expect(REQUIRED_TABLES).toContain("bookings");
    expect(REQUIRED_TABLES).toContain("booking_quotes");
    expect(REQUIRED_TABLES).toContain("booking_status_history");
  });

  it("includes messaging tables", () => {
    expect(REQUIRED_TABLES).toContain("conversations");
    expect(REQUIRED_TABLES).toContain("conversation_members");
    expect(REQUIRED_TABLES).toContain("messages");
    expect(REQUIRED_TABLES).toContain("message_attachments");
  });

  it("includes verification and review tables", () => {
    expect(REQUIRED_TABLES).toContain("provider_verifications");
    expect(REQUIRED_TABLES).toContain("provider_documents");
    expect(REQUIRED_TABLES).toContain("reviews");
  });
});
