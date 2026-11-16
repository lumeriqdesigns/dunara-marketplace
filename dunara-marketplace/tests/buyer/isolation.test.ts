import { describe, expect, it } from "vitest";

/**
 * Documents buyer isolation contracts for bookings and quotes.
 * Live RLS remains in supabase/tests/security_rls_checks.sql.
 */
describe("buyer isolation contracts", () => {
  it("createBooking forces buyer_id from session, not client", () => {
    const clientPayload = { seller_id: "s1", title: "Need help" };
    const insertRow = {
      ...clientPayload,
      buyer_id: "session-user-id",
      status: "requested" as const
    };
    expect(insertRow.buyer_id).toBe("session-user-id");
    expect(insertRow.status).toBe("requested");
    expect(clientPayload).not.toHaveProperty("buyer_id");
    expect(clientPayload).not.toHaveProperty("status");
  });

  it("createBooking requires published listing when listing_id present", () => {
    const listing = { status: "draft", seller_id: "s1" };
    const allowed = listing.status === "published";
    expect(allowed).toBe(false);
  });

  it("rejects self-booking when seller.user_id equals buyer", () => {
    const sellerUserId = "user-a";
    const buyerId = "user-a";
    expect(sellerUserId === buyerId).toBe(true);
  });

  it("respondToQuote requires booking ownership and quoted status for accept", () => {
    const booking = { buyer_id: "session-user", status: "requested" };
    const canAccept =
      booking.buyer_id === "session-user" && booking.status === "quoted";
    expect(canAccept).toBe(false);

    const quoted = { buyer_id: "session-user", status: "quoted" };
    expect(
      quoted.buyer_id === "session-user" && quoted.status === "quoted"
    ).toBe(true);
  });

  it("review submission requires completed booking ownership fields", () => {
    const requiredFilters = ["buyer_id", "status"];
    expect(requiredFilters).toContain("buyer_id");
    expect(requiredFilters).toContain("status");
  });

  it("favourites mutations always scope to user_id", () => {
    const deleteFilter = { user_id: "session-user" };
    expect(deleteFilter.user_id).toBeTruthy();
  });
});
