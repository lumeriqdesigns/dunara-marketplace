import { describe, expect, it } from "vitest";
import { canTransitionBooking } from "@/features/booking/lib/transitions";

describe("booking lifecycle (UI mirror; database RPC is authoritative)", () => {
  it("permits normal request → quote → acceptance → confirmation → delivery", () => {
    expect(canTransitionBooking("requested", "quoted")).toBe(true);
    expect(canTransitionBooking("quoted", "accepted")).toBe(true);
    expect(canTransitionBooking("accepted", "confirmed")).toBe(true);
    expect(canTransitionBooking("confirmed", "in_progress")).toBe(true);
    expect(canTransitionBooking("in_progress", "completed")).toBe(true);
  });

  it("rejects terminal and skipped transitions", () => {
    expect(canTransitionBooking("completed", "in_progress")).toBe(false);
    expect(canTransitionBooking("declined", "accepted")).toBe(false);
    expect(canTransitionBooking("requested", "completed")).toBe(false);
    expect(canTransitionBooking("cancelled", "confirmed")).toBe(false);
  });

  it("allows dispute and lists authorized return targets (admin enforced in DB)", () => {
    expect(canTransitionBooking("confirmed", "disputed")).toBe(true);
    expect(canTransitionBooking("disputed", "confirmed")).toBe(true);
    expect(canTransitionBooking("disputed", "completed")).toBe(true);
  });

  it("allows seller confirmation path from accepted", () => {
    expect(canTransitionBooking("accepted", "awaiting_confirmation")).toBe(true);
    expect(canTransitionBooking("accepted", "confirmed")).toBe(true);
  });
});
