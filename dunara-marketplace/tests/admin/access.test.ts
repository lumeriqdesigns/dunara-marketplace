import { describe, it, expect } from "vitest";
import {
  canAccessSection,
  canSuspendUsers,
  canModerateListings,
  visibleAdminNav
} from "@/features/admin/lib/access";
import type { SessionUser } from "@/lib/permissions";

function user(roles: SessionUser["roles"]): SessionUser {
  return { id: "u1", email: "t@example.com", roles };
}

describe("Admin section access", () => {
  it("support cannot access settings or audit", () => {
    const u = user(["support"]);
    expect(canAccessSection(u, "overview")).toBe(true);
    expect(canAccessSection(u, "users")).toBe(true);
    expect(canAccessSection(u, "reports")).toBe(true);
    expect(canAccessSection(u, "settings")).toBe(false);
    expect(canAccessSection(u, "audit")).toBe(false);
    expect(canAccessSection(u, "listings")).toBe(false);
  });

  it("moderator can moderate listings and reviews but not suspend users", () => {
    const u = user(["moderator"]);
    expect(canAccessSection(u, "listings")).toBe(true);
    expect(canAccessSection(u, "reviews")).toBe(true);
    expect(canModerateListings(u)).toBe(true);
    expect(canSuspendUsers(u)).toBe(false);
    expect(canAccessSection(u, "settings")).toBe(false);
  });

  it("verification_officer limited to verification and sellers", () => {
    const u = user(["verification_officer"]);
    expect(canAccessSection(u, "verification")).toBe(true);
    expect(canAccessSection(u, "sellers")).toBe(true);
    expect(canAccessSection(u, "users")).toBe(false);
    expect(canAccessSection(u, "listings")).toBe(false);
  });

  it("super_admin sees all nav sections", () => {
    const u = user(["super_admin"]);
    const nav = visibleAdminNav(u);
    expect(nav.length).toBeGreaterThanOrEqual(11);
    expect(canAccessSection(u, "settings")).toBe(true);
    expect(canSuspendUsers(u)).toBe(true);
  });

  it("buyer alone cannot access any admin section", () => {
    const u = user(["buyer"]);
    expect(canAccessSection(u, "overview")).toBe(false);
    expect(visibleAdminNav(u)).toHaveLength(0);
  });

  it("operations_manager can suspend and audit but not settings", () => {
    const u = user(["operations_manager"]);
    expect(canSuspendUsers(u)).toBe(true);
    expect(canAccessSection(u, "audit")).toBe(true);
    expect(canAccessSection(u, "settings")).toBe(false);
  });
});
