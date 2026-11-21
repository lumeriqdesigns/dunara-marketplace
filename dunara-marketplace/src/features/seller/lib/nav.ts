import { PLANS_BRAND } from "@/config/plans";

/**
 * Seller module navigation.
 */
export const sellerNav = [
  { href: "/seller", label: "Overview", exact: true },
  { href: "/seller/listings", label: "Listings", exact: false },
  { href: "/seller/shop", label: "Shop", exact: false },
  { href: "/seller/verification", label: "Verification", exact: false },
  { href: "/seller/ai", label: "AI Assistant", exact: false },
  { href: "/seller/billing", label: PLANS_BRAND.sellerNavLabel, exact: false },
  { href: "/seller/settings", label: "Settings", exact: false },
] as const;

export type SellerNavItem = (typeof sellerNav)[number];

export function isNavActive(pathname: string, item: SellerNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
