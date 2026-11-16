/**
 * Role-based section access for the admin area.
 * No universal "admin does everything" — each section maps to staff roles.
 */

import type { MarketplaceRole, SessionUser } from "@/lib/permissions";
import { hasAnyRole, hasRole } from "@/lib/permissions";

export type AdminSection =
  | "overview"
  | "users"
  | "sellers"
  | "verification"
  | "categories"
  | "listings"
  | "bookings"
  | "reviews"
  | "reports"
  | "audit"
  | "settings";

const SECTION_ROLES: Record<AdminSection, MarketplaceRole[]> = {
  overview: [
    "support",
    "verification_officer",
    "moderator",
    "operations_manager",
    "super_admin"
  ],
  users: ["support", "operations_manager", "super_admin"],
  sellers: [
    "support",
    "verification_officer",
    "operations_manager",
    "super_admin"
  ],
  verification: ["verification_officer", "super_admin"],
  categories: ["operations_manager", "super_admin"],
  listings: ["moderator", "operations_manager", "super_admin"],
  bookings: ["support", "operations_manager", "super_admin"],
  reviews: ["moderator", "operations_manager", "super_admin"],
  reports: ["support", "moderator", "operations_manager", "super_admin"],
  audit: ["operations_manager", "super_admin"],
  settings: ["super_admin"]
};

export function canAccessSection(
  user: SessionUser | null,
  section: AdminSection
): boolean {
  if (!user) return false;
  if (hasRole(user, "super_admin")) return true;
  return hasAnyRole(user, SECTION_ROLES[section]);
}

/** Roles that may suspend / reinstate accounts */
export function canSuspendUsers(user: SessionUser | null): boolean {
  return hasAnyRole(user, ["operations_manager", "super_admin"]);
}

/** Roles that may moderate listings */
export function canModerateListings(user: SessionUser | null): boolean {
  return hasAnyRole(user, ["moderator", "operations_manager", "super_admin"]);
}

/** Nav items visible to this user */
export function visibleAdminNav(
  user: SessionUser | null
): { href: string; label: string; section: AdminSection }[] {
  const all: { href: string; label: string; section: AdminSection }[] = [
    { href: "/admin/dashboard", label: "Overview", section: "overview" },
    { href: "/admin/users", label: "Users", section: "users" },
    { href: "/admin/sellers", label: "Sellers", section: "sellers" },
    { href: "/admin/verification", label: "Verification", section: "verification" },
    { href: "/admin/categories", label: "Categories", section: "categories" },
    { href: "/admin/listings", label: "Listings", section: "listings" },
    { href: "/admin/bookings", label: "Bookings", section: "bookings" },
    { href: "/admin/reviews", label: "Reviews", section: "reviews" },
    { href: "/admin/reports", label: "Reports", section: "reports" },
    { href: "/admin/audit", label: "Audit logs", section: "audit" },
    { href: "/admin/settings", label: "Settings", section: "settings" }
  ];
  return all.filter((item) => canAccessSection(user, item.section));
}
