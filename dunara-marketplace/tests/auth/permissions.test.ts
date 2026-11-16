import { describe, expect, it } from "vitest";
import {
  hasRole,
  isAdmin,
  isBuyer,
  isSeller,
  canAccessBuyerDashboard,
  canAccessSellerDashboard,
  canAccessAdminArea,
  canSelfAssign,
  isPrivilegedRole,
  type SessionUser
} from "@/lib/permissions";

const buyerOnly: SessionUser = {
  id: "u1",
  email: "buyer@example.com",
  roles: ["buyer"]
};

const sellerOnly: SessionUser = {
  id: "u2",
  email: "seller@example.com",
  roles: ["seller"]
};

const both: SessionUser = {
  id: "u3",
  email: "both@example.com",
  roles: ["buyer", "seller"]
};

const officer: SessionUser = {
  id: "u4",
  email: "officer@example.com",
  roles: ["buyer", "verification_officer"]
};

const superAdmin: SessionUser = {
  id: "u5",
  email: "admin@example.com",
  roles: ["super_admin"]
};

describe("role helpers", () => {
  it("detects buyer and seller roles", () => {
    expect(isBuyer(buyerOnly)).toBe(true);
    expect(isSeller(buyerOnly)).toBe(false);
    expect(isSeller(sellerOnly)).toBe(true);
    expect(isBuyer(both)).toBe(true);
    expect(isSeller(both)).toBe(true);
  });

  it("allows a user to hold buyer and seller simultaneously", () => {
    expect(hasRole(both, "buyer")).toBe(true);
    expect(hasRole(both, "seller")).toBe(true);
  });

  it("identifies privileged and admin roles", () => {
    expect(isPrivilegedRole("super_admin")).toBe(true);
    expect(isPrivilegedRole("verification_officer")).toBe(true);
    expect(isPrivilegedRole("buyer")).toBe(false);
    expect(isPrivilegedRole("seller")).toBe(false);
    expect(isAdmin(officer)).toBe(true);
    expect(isAdmin(buyerOnly)).toBe(false);
    expect(isAdmin(superAdmin)).toBe(true);
  });

  it("only allows self-assignment of buyer and seller", () => {
    expect(canSelfAssign("buyer")).toBe(true);
    expect(canSelfAssign("seller")).toBe(true);
    expect(canSelfAssign("super_admin")).toBe(false);
    expect(canSelfAssign("moderator")).toBe(false);
    expect(canSelfAssign("verification_officer")).toBe(false);
  });
});

describe("dashboard access", () => {
  it("grants buyer dashboard to buyers and admins", () => {
    expect(canAccessBuyerDashboard(buyerOnly)).toBe(true);
    expect(canAccessBuyerDashboard(both)).toBe(true);
    expect(canAccessBuyerDashboard(superAdmin)).toBe(true);
    expect(canAccessBuyerDashboard(sellerOnly)).toBe(false);
    expect(canAccessBuyerDashboard(null)).toBe(false);
  });

  it("grants seller dashboard to sellers and admins", () => {
    expect(canAccessSellerDashboard(sellerOnly)).toBe(true);
    expect(canAccessSellerDashboard(both)).toBe(true);
    expect(canAccessSellerDashboard(superAdmin)).toBe(true);
    expect(canAccessSellerDashboard(buyerOnly)).toBe(false);
    expect(canAccessSellerDashboard(null)).toBe(false);
  });

  it("restricts admin area to privileged roles only", () => {
    expect(canAccessAdminArea(superAdmin)).toBe(true);
    expect(canAccessAdminArea(officer)).toBe(true);
    expect(canAccessAdminArea(buyerOnly)).toBe(false);
    expect(canAccessAdminArea(sellerOnly)).toBe(false);
    expect(canAccessAdminArea(both)).toBe(false);
    expect(canAccessAdminArea(null)).toBe(false);
  });
});
