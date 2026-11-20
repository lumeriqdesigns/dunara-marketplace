"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { slugify, withSlugSuffix } from "@/features/shop/lib/slug";
import { listingFormSchema } from "./schemas";
import { nairaToKobo } from "./lib/price";
import {
  getOwnListing,
  isListingSlugAvailable,
  countPublishedListings,
} from "./lib/get-listings";
import { getShopEntitlement, expireTrials } from "@/features/billing/lib/subscription-service";
import { canPublishAnotherListing } from "@/features/billing/lib/entitlements";

export type ListingActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  listingId?: string;
};

function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") obj[key] = value;
  });
  return obj;
}

async function requireOwnedShop(userId: string) {
  const shop = await getOwnShop(userId);
  if (!shop) {
    return { error: "Create a shop before adding listings." as const, shop: null };
  }
  return { error: null, shop };
}

/**
 * Create a draft listing under the seller's shop.
 */
export async function createListingAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const user = await requireUser("/seller/listings");
  const { error: shopError, shop } = await requireOwnedShop(user.id);
  if (shopError || !shop) {
    return { ok: false, message: shopError ?? "No shop" };
  }

  const raw = formToObject(formData);
  if (!raw.slug || String(raw.slug).trim() === "") {
    raw.slug = slugify(String(raw.title ?? ""));
  }

  const parsed = listingFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let slug = parsed.data.slug;
  if (!(await isListingSlugAvailable(shop.id, slug))) {
    let found = false;
    for (let i = 1; i <= 8; i++) {
      const candidate = withSlugSuffix(slugify(parsed.data.title), i);
      if (await isListingSlugAvailable(shop.id, candidate)) {
        slug = candidate;
        found = true;
        break;
      }
    }
    if (!found) {
      return {
        ok: false,
        message: "That URL slug is taken in your shop. Choose another.",
        fieldErrors: { slug: ["Slug already used"] },
      };
    }
  }

  const priceKobo =
    parsed.data.priceType === "negotiable"
      ? null
      : nairaToKobo(parsed.data.priceNaira);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .insert({
      shop_id: shop.id,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      listing_type: parsed.data.listingType,
      category_id: parsed.data.categoryId,
      price_type: parsed.data.priceType,
      price_kobo: priceKobo,
      is_published: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createListing:", error);
    if (error.code === "23505") {
      return { ok: false, message: "Slug conflict. Try a different title or slug." };
    }
    return { ok: false, message: "Could not create listing." };
  }

  revalidatePath("/seller/listings");
  redirect(`/seller/listings/${data.id}`);
}

/**
 * Update listing fields (owner only).
 */
export async function updateListingAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const user = await requireUser("/seller/listings");
  const { error: shopError, shop } = await requireOwnedShop(user.id);
  if (shopError || !shop) {
    return { ok: false, message: shopError ?? "No shop" };
  }

  const listingId = String(formData.get("listingId") ?? "");
  if (!listingId) return { ok: false, message: "Missing listing id." };

  const existing = await getOwnListing(listingId, shop.id);
  if (!existing) {
    return { ok: false, message: "Listing not found." };
  }

  const raw = formToObject(formData);
  const parsed = listingFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const slug = parsed.data.slug;
  if (
    slug !== existing.slug &&
    !(await isListingSlugAvailable(shop.id, slug, listingId))
  ) {
    return {
      ok: false,
      message: "That slug is already used in your shop.",
      fieldErrors: { slug: ["Slug already used"] },
    };
  }

  const priceKobo =
    parsed.data.priceType === "negotiable"
      ? null
      : nairaToKobo(parsed.data.priceNaira);

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      listing_type: parsed.data.listingType,
      category_id: parsed.data.categoryId,
      price_type: parsed.data.priceType,
      price_kobo: priceKobo,
    })
    .eq("id", listingId)
    .eq("shop_id", shop.id);

  if (error) {
    console.error("updateListing:", error);
    return { ok: false, message: "Could not save listing." };
  }

  revalidatePath("/seller/listings");
  revalidatePath(`/seller/listings/${listingId}`);
  revalidatePath(`/listing/${shop.slug}/${slug}`);
  if (existing.slug !== slug) {
    revalidatePath(`/listing/${shop.slug}/${existing.slug}`);
  }

  return { ok: true, message: "Listing saved.", listingId };
}

/**
 * Publish or unpublish. Requires shop published + not suspended for publish.
 * Plan limits enforced via entitlement helper (defaults to Open until billing).
 */
export async function setListingPublishedAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const user = await requireUser("/seller/listings");
  const { error: shopError, shop } = await requireOwnedShop(user.id);
  if (shopError || !shop) {
    return { ok: false, message: shopError ?? "No shop" };
  }

  const listingId = String(formData.get("listingId") ?? "");
  const publish = formData.get("publish") === "true";

  const listing = await getOwnListing(listingId, shop.id);
  if (!listing) return { ok: false, message: "Listing not found." };

  if (publish) {
    if (!shop.is_published || shop.is_suspended) {
      return {
        ok: false,
        message:
          "Publish your shop first (and ensure it is not suspended) before publishing listings.",
      };
    }
    if (!listing.title?.trim() || !listing.slug) {
      return { ok: false, message: "Listing needs a title and slug before publishing." };
    }

    if (!listing.is_published) {
      await expireTrials();
      const publishedCount = await countPublishedListings(shop.id);
      const entitlement = await getShopEntitlement(shop.id);
      const limitCheck = canPublishAnotherListing(publishedCount, entitlement);
      if (!limitCheck.ok) {
        return { ok: false, message: limitCheck.message };
      }
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ is_published: publish })
    .eq("id", listingId)
    .eq("shop_id", shop.id);

  if (error) {
    return { ok: false, message: "Could not update publish status." };
  }

  revalidatePath("/seller/listings");
  revalidatePath(`/seller/listings/${listingId}`);
  revalidatePath(`/listing/${shop.slug}/${listing.slug}`);
  revalidatePath(`/shop/${shop.slug}`);

  return {
    ok: true,
    message: publish ? "Listing is now public." : "Listing unpublished.",
    listingId,
  };
}

const MAX_GALLERY = 6;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Upload cover image or gallery image to listing-images bucket.
 */
export async function uploadListingImageAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const user = await requireUser("/seller/listings");
  const { error: shopError, shop } = await requireOwnedShop(user.id);
  if (shopError || !shop) {
    return { ok: false, message: shopError ?? "No shop" };
  }

  const listingId = String(formData.get("listingId") ?? "");
  const role = String(formData.get("role") ?? "gallery"); // cover | gallery
  const listing = await getOwnListing(listingId, shop.id);
  if (!listing) return { ok: false, message: "Listing not found." };

  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) {
    return { ok: false, message: "Choose an image file." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "Image must be 3MB or smaller." };
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return { ok: false, message: "Use JPEG, PNG, WebP, or GIF." };
  }

  if (role === "gallery") {
    const count = listing.listing_media?.length ?? 0;
    if (count >= MAX_GALLERY) {
      return { ok: false, message: `Maximum ${MAX_GALLERY} gallery images.` };
    }
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const path = `${shop.id}/${listingId}/${role}-${Date.now()}.${ext}`;
  const supabase = await createClient();

  const { error: uploadError } = await supabase.storage
    .from("listing-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("listing image upload:", uploadError);
    return {
      ok: false,
      message:
        "Upload failed. Ensure the listing-images storage bucket exists and allows authenticated uploads.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("listing-images").getPublicUrl(path);

  if (role === "cover") {
    const { error } = await supabase
      .from("listings")
      .update({ cover_image_url: publicUrl })
      .eq("id", listingId)
      .eq("shop_id", shop.id);
    if (error) return { ok: false, message: "Could not set cover image." };
  } else {
    const sortOrder = (listing.listing_media?.length ?? 0) + 1;
    const { error } = await supabase.from("listing_media").insert({
      listing_id: listingId,
      url: publicUrl,
      sort_order: sortOrder,
    });
    if (error) return { ok: false, message: "Could not add gallery image." };
  }

  revalidatePath(`/seller/listings/${listingId}`);
  revalidatePath(`/listing/${shop.slug}/${listing.slug}`);

  return { ok: true, message: "Image uploaded.", listingId };
}

/**
 * Remove a gallery media row (owner only). Does not delete storage object in MVP.
 */
export async function removeListingMediaAction(
  _prev: ListingActionState,
  formData: FormData
): Promise<ListingActionState> {
  const user = await requireUser("/seller/listings");
  const { error: shopError, shop } = await requireOwnedShop(user.id);
  if (shopError || !shop) {
    return { ok: false, message: shopError ?? "No shop" };
  }

  const listingId = String(formData.get("listingId") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "");
  const listing = await getOwnListing(listingId, shop.id);
  if (!listing) return { ok: false, message: "Listing not found." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("listing_media")
    .delete()
    .eq("id", mediaId)
    .eq("listing_id", listingId);

  if (error) return { ok: false, message: "Could not remove image." };

  revalidatePath(`/seller/listings/${listingId}`);
  return { ok: true, message: "Image removed.", listingId };
}
