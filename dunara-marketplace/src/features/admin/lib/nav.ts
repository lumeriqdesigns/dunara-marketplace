export const adminNav = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/shops", label: "Shops", exact: false },
  { href: "/admin/listings", label: "Listings", exact: false },
  { href: "/admin/verifications", label: "Verifications", exact: false },
  { href: "/admin/subscriptions", label: "Subscriptions", exact: false },
] as const;

export type AdminNavItem = (typeof adminNav)[number];

export function isAdminNavActive(pathname: string, item: AdminNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
