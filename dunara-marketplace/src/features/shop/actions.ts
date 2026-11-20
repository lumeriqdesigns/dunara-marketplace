"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/lib/require-user";
import { createShopSchema, updateShopSchema, canPublishShop } from "./schemas";
import { slugify, withSlugSuffix, isValidSlug } from "./lib/slug";
import { normalizePhone } from "./lib/phone";
import { isSlugAvailable, getOwnShop } from "./lib/get-shop";
import { startPulseTrial } from "@/features/billing/lib/subscription-service";
import { isOverUploadLimit, uploadTooLargeMessage } from "@/lib/upload-limits";

export type ShopActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  slugSuggestion?: string;
};

function formToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") obj[key] = value;
  });
  return obj;
}

/**
 * Create the seller's single shop (onboarding).
 * Enforces one-shop-per-owner via unique constraint + pre-check.
 */
export async function createShopAction(
  _prev: ShopActionState,
  formData: FormData
): Promise<ShopActionState> {
  const user = await requireUser("/seller/shop");
  const supabase = await createClient();

  // Already has a shop?
  const existing = await getOwnShop(user.id);
  if (existing) {
    return { ok: false, message: "You already have a shop. Edit it instead." };
  }

  const raw = formToObject(formData);
  // Auto-slug from name if blank
  if (!raw.slug || String(raw.slug).trim() === "") {
    raw.slug = slugify(String(raw.name ?? ""));
  }

  const parsed = createShopSchema.safeParse({
    name: raw.name,
    slug: raw.slug,
    categoryId: raw.categoryId,
    shopType: raw.shopType,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  let slug = parsed.data.slug;
  if (!(await isSlugAvailable(slug))) {
    // Try a few suffixes
    let found = false;
    for (let i = 1; i <= 5; i++) {
      const candidate = withSlugSuffix(slugify(parsed.data.name), i);
      if (await isSlugAvailable(candidate)) {
        slug = candidate;
        found = true;
        break;
      }
    }
    if (!found) {
      return {
        ok: false,
        message: "That URL is taken. Choose a different shop name or slug.",
        fieldErrors: { slug: ["This URL is already in use"] },
        slugSuggestion: withSlugSuffix(slugify(parsed.data.name), Date.now() % 1000),
      };
    }
  }

  const { data, error } = await supabase
    .from("shops")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      slug,
      category_id: parsed.data.categoryId,
      shop_type: parsed.data.shopType,
      is_published: false,
      country: "Nigeria",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        message:
          error.message.includes("owner") || error.details?.includes("owner")
            ? "You already have a shop."
            : "That shop URL is already taken.",
      };
    }
    console.error("createShop:", error);
    return { ok: false, message: "Could not create shop. Please try again." };
  }

  // 3-day Pulse trial (no card)
  try {
    await startPulseTrial(data.id);
  } catch (e) {
    console.error("trial start failed:", e);
  }

  revalidatePath("/seller");
  revalidatePath("/seller/shop");
  revalidatePath("/seller/billing");
  redirect("/seller/shop");
}

/**
 * Update shop profile fields (owner only via RLS).
 */
export async function updateShopAction(
  _prev: ShopActionState,
  formData: FormData
): Promise<ShopActionState> {
  const user = await requireUser("/seller/shop");
  const supabase = await createClient();
  const shop = await getOwnShop(user.id);

  if (!shop) {
    return { ok: false, message: "No shop found. Create one first." };
  }

  const raw = formToObject(formData);
  const parsed = updateShopSchema.safeParse({
    name: raw.name,
    slug: raw.slug,
    bio: raw.bio,
    categoryId: raw.categoryId || null,
    shopType: raw.shopType,
    phone: raw.phone,
    email: raw.email,
    state: raw.state,
    city: raw.city,
    instagram: raw.instagram,
    tiktok: raw.tiktok,
    facebook: raw.facebook,
    twitter: raw.twitter,
    website: raw.website,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const slug = data.slug;
  if (slug !== shop.slug && !(await isSlugAvailable(slug, shop.id))) {
    return {
      ok: false,
      message: "That URL is already taken.",
      fieldErrors: { slug: ["This URL is already in use"] },
    };
  }

  const phoneNormalized = normalizePhone(data.phone);
  if (!phoneNormalized) {
    return {
      ok: false,
      fieldErrors: { phone: ["Enter a valid phone number"] },
      message: "Invalid WhatsApp number.",
    };
  }

  const { error } = await supabase
    .from("shops")
    .update({
      name: data.name,
      slug,
      bio: data.bio,
      category_id: data.categoryId ?? null,
      shop_type: data.shopType,
      phone: phoneNormalized,
      email: data.email,
      state: data.state,
      city: data.city,
      instagram: data.instagram,
      tiktok: data.tiktok,
      facebook: data.facebook,
      twitter: data.twitter,
      website: data.website,
      // Never touch verification / suspension from client
    })
    .eq("id", shop.id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("updateShop:", error);
    if (error.code === "23505") {
      return { ok: false, message: "That shop URL is already taken." };
    }
    return { ok: false, message: "Could not save changes. Please try again." };
  }

  revalidatePath("/seller/shop");
  revalidatePath(`/shop/${slug}`);
  if (shop.slug !== slug) {
    revalidatePath(`/shop/${shop.slug}`);
  }

  return { ok: true, message: "Shop profile saved." };
}

/**
 * Publish or unpublish. Publish requires complete public fields.
 */
export async function setShopPublishedAction(
  _prev: ShopActionState,
  formData: FormData
): Promise<ShopActionState> {
  const user = await requireUser("/seller/shop");
  const supabase = await createClient();
  const shop = await getOwnShop(user.id);

  if (!shop) {
    return { ok: false, message: "No shop found." };
  }

  if (shop.is_suspended) {
    return {
      ok: false,
      message: "Your shop is suspended and cannot be published. Contact support.",
    };
  }

  const publish = formData.get("publish") === "true";

  if (publish) {
    const check = canPublishShop({
      name: shop.name,
      slug: shop.slug,
      phone: shop.phone,
      category_id: shop.category_id,
      shop_type: shop.shop_type,
    });
    if (!check.ok) {
      return {
        ok: false,
        message: `Complete your profile before publishing: ${check.reasons.join("; ")}`,
      };
    }
  }

  const { error } = await supabase
    .from("shops")
    .update({ is_published: publish })
    .eq("id", shop.id)
    .eq("owner_id", user.id);

  if (error) {
    console.error("setShopPublished:", error);
    return { ok: false, message: "Could not update publish status." };
  }

  revalidatePath("/seller/shop");
  revalidatePath(`/shop/${shop.slug}`);

  return {
    ok: true,
    message: publish ? "Shop is now public." : "Shop is unpublished.",
  };
}

/**
 * Upload shop logo to private-ish public bucket with ownership-scoped path.
 * Bucket: shop-logos (create in Supabase dashboard; public read for logos is OK).
 */
export async function uploadShopLogoAction(
  _prev: ShopActionState,
  formData: FormData
): Promise<ShopActionState> {
  const user = await requireUser("/seller/shop");
  const supabase = await createClient();
  const shop = await getOwnShop(user.id);

  if (!shop) {
    return { ok: false, message: "Create a shop first." };
  }

  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) {
    return { ok: false, message: "Choose an image file." };
  }

  if (isOverUploadLimit(file)) {
    return { ok: false, message: uploadTooLargeMessage("Logo") };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return { ok: false, message: "Use JPEG, PNG, WebP, or GIF." };
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : "jpg";

  const path = `${shop.id}/logo-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("shop-logos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("logo upload:", uploadError);
    return {
      ok: false,
      message:
        "Could not upload logo. Ensure the shop-logos storage bucket exists and allows authenticated uploads.",
    };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("shop-logos").getPublicUrl(path);

  const { error } = await supabase
    .from("shops")
    .update({ logo_url: publicUrl })
    .eq("id", shop.id)
    .eq("owner_id", user.id);

  if (error) {
    return { ok: false, message: "Logo uploaded but profile update failed." };
  }

  revalidatePath("/seller/shop");
  revalidatePath(`/shop/${shop.slug}`);

  return { ok: true, message: "Logo updated." };
}

/**
 * Server action used by client slug helper (optional).
 */
export async function checkSlugAction(slug: string, excludeId?: string): Promise<boolean> {
  if (!isValidSlug(slug)) return false;
  return isSlugAvailable(slug, excludeId);
}
