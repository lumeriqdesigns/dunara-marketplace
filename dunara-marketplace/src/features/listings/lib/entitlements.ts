/**
 * @deprecated Prefer @/features/billing/lib/entitlements
 * Re-exports for backward compatibility with earlier listing code.
 */
export {
  canPublishAnotherListing,
  OPEN_ENTITLEMENT as DEFAULT_ENTITLEMENT,
  type EffectiveEntitlement as ListingEntitlement,
} from "@/features/billing/lib/entitlements";
