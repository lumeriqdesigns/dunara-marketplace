"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/lib/require-user";
import { z } from "zod";

export type SettingsActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),
});

/**
 * Update authenticated user's profile (own row only).
 * WhatsApp number is owned by Shop Settings — not collected here.
 */
export async function updateProfileAction(
  _prev: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const user = await requireUser("/seller/settings");
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName })
    .eq("id", user.id);

  if (error) {
    console.error("updateProfile:", error.message);
    return { ok: false, message: "Could not save profile." };
  }

  // Also update auth metadata for display consistency
  await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  revalidatePath("/seller");
  revalidatePath("/seller/settings");
  return { ok: true, message: "Profile saved." };
}
