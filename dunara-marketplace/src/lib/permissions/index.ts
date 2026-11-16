import {
  type MarketplaceRole,
  isAdminRole,
  isPrivilegedRole,
  canSelfAssign
} from "./roles";

export {
  MARKETPLACE_ROLES,
  SELF_ASSIGNABLE_ROLES,
  PRIVILEGED_ROLES,
  ADMIN_ROLES,
  isPrivilegedRole,
  isAdminRole,
  canSelfAssign,
  type MarketplaceRole
} from "./roles";

export type SessionUser = {
  id: string;
  email: string | null;
  roles: MarketplaceRole[];
};

/**
 * Server-side permission checks.
 * Never rely on UI visibility alone — always call these (or equivalent DB helpers).
 */
export function hasRole(user: SessionUser | null, role: MarketplaceRole): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

export function hasAnyRole(
  user: SessionUser | null,
  roles: MarketplaceRole[]
): boolean {
  if (!user) return false;
  return roles.some((r) => user.roles.includes(r));
}

export function isBuyer(user: SessionUser | null): boolean {
  return hasRole(user, "buyer");
}

export function isSeller(user: SessionUser | null): boolean {
  return hasRole(user, "seller");
}

export function isAdmin(user: SessionUser | null): boolean {
  if (!user) return false;
  return user.roles.some(isAdminRole);
}

export function canAccessBuyerDashboard(user: SessionUser | null): boolean {
  return !!user && (isBuyer(user) || isAdmin(user));
}

export function canAccessSellerDashboard(user: SessionUser | null): boolean {
  return !!user && (isSeller(user) || isAdmin(user));
}

export function canAccessAdminArea(user: SessionUser | null): boolean {
  return isAdmin(user);
}

/**
 * Guard used by server actions / route handlers.
 * Throws a plain Error so callers can map to HTTP responses.
 */
export function assertAuthenticated(user: SessionUser | null): asserts user is SessionUser {
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
}

export function assertRole(
  user: SessionUser | null,
  role: MarketplaceRole
): asserts user is SessionUser {
  assertAuthenticated(user);
  if (!hasRole(user, role) && !isAdmin(user)) {
    throw new Error("FORBIDDEN");
  }
}

export function assertAdmin(user: SessionUser | null): asserts user is SessionUser {
  assertAuthenticated(user);
  if (!isAdmin(user)) {
    throw new Error("FORBIDDEN");
  }
}

/**
 * Prefer this in every admin page and admin server action.
 * Throws FORBIDDEN / UNAUTHENTICATED for callers to map.
 */
export function requireAdmin(user: SessionUser | null): SessionUser {
  assertAdmin(user);
  return user;
}

/**
 * Narrower staff check for moderation / verification officers.
 */
export function requireAnyStaffRole(
  user: SessionUser | null,
  roles: MarketplaceRole[]
): SessionUser {
  assertAuthenticated(user);
  if (!hasAnyRole(user, roles) && !hasRole(user, "super_admin")) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

