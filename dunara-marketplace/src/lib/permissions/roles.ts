/**
 * Dúnarà Marketplace — Role definitions and helpers
 * Privileged roles must never be self-assigned from the client.
 */

export const MARKETPLACE_ROLES = [
  "buyer",
  "seller",
  "support",
  "verification_officer",
  "moderator",
  "operations_manager",
  "super_admin"
] as const;

export type MarketplaceRole = (typeof MARKETPLACE_ROLES)[number];

/** Roles that a normal user may activate for themselves (server-validated). */
export const SELF_ASSIGNABLE_ROLES: MarketplaceRole[] = ["buyer", "seller"];

/** Privileged staff roles — only grantable via trusted server-side operations. */
export const PRIVILEGED_ROLES: MarketplaceRole[] = [
  "support",
  "verification_officer",
  "moderator",
  "operations_manager",
  "super_admin"
];

export const ADMIN_ROLES: MarketplaceRole[] = [
  "support",
  "verification_officer",
  "moderator",
  "operations_manager",
  "super_admin"
];

export function isPrivilegedRole(role: string): boolean {
  return (PRIVILEGED_ROLES as readonly string[]).includes(role);
}

export function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

export function canSelfAssign(role: string): boolean {
  return (SELF_ASSIGNABLE_ROLES as readonly string[]).includes(role);
}
