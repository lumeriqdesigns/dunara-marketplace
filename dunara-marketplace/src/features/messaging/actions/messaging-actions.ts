"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import {
import { mapClientError, logServerError } from "@/lib/security/errors";
  ALLOWED_ATTACHMENT_MIME,
  MAX_ATTACHMENT_BYTES,
} from "@/features/messaging/lib/types";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
  conversationId?: string;
  messageId?: string;
  signedUrl?: string;
};

async function requireAuth() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

/**
 * Start or reuse a 1:1 conversation with another user (optionally tied to a booking).
 */
export async function startConversation(formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();
    const otherUserId = String(formData.get("other_user_id") ?? "").trim();
    const bookingId = String(formData.get("booking_id") ?? "").trim() || null;
    const subject = String(formData.get("subject") ?? "").trim() || null;

    if (!otherUserId) return { ok: false, error: "Recipient is required." };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("messaging_start_conversation", {
      p_other_user_id: otherUserId,
      p_booking_id: bookingId,
      p_subject: subject,
    });

    if (error) return { ok: false, error: error.message };

    const conversationId = data as string;
    revalidatePath("/buyer/messages");
    revalidatePath("/seller/messages");
    return {
      ok: true,
      message: "Conversation ready.",
      conversationId,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not start conversation.",
    };
  }
}

/**
 * Send a text message via the authoritative RPC.
 */
export async function sendMessage(formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();
    const conversationId = String(formData.get("conversation_id") ?? "").trim();
    const body = String(formData.get("body") ?? "");
    const clientId = String(formData.get("client_id") ?? "").trim() || null;

    if (!conversationId) return { ok: false, error: "Conversation is required." };
    if (!body.trim()) return { ok: false, error: "Message cannot be empty." };

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("messaging_send_message", {
      p_conversation_id: conversationId,
      p_body: body,
      p_client_id: clientId,
    });

    if (error) return { ok: false, error: error.message };

    const msg = data as { id: string };
    revalidatePath(`/buyer/messages/${conversationId}`);
    revalidatePath(`/seller/messages/${conversationId}`);
    revalidatePath("/buyer/messages");
    revalidatePath("/seller/messages");
    return { ok: true, message: "Sent.", messageId: msg?.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not send message.",
    };
  }
}

/**
 * Mark a conversation as read for the current user.
 */
export async function markConversationRead(
  conversationId: string
): Promise<ActionResult> {
  try {
    await requireAuth();
    if (!conversationId) return { ok: false, error: "Conversation is required." };

    const supabase = await createClient();
    const { error } = await supabase.rpc("messaging_mark_read", {
      p_conversation_id: conversationId,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/buyer/messages");
    revalidatePath("/seller/messages");
    revalidatePath(`/buyer/messages/${conversationId}`);
    revalidatePath(`/seller/messages/${conversationId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not mark as read.",
    };
  }
}

/**
 * Soft-delete own message.
 */
export async function softDeleteMessage(messageId: string): Promise<ActionResult> {
  try {
    await requireAuth();
    if (!messageId) return { ok: false, error: "Message is required." };

    const supabase = await createClient();
    const { error } = await supabase.rpc("messaging_soft_delete_message", {
      p_message_id: messageId,
    });
    if (error) return { ok: false, error: error.message };

    revalidatePath("/buyer/messages");
    revalidatePath("/seller/messages");
    return { ok: true, message: "Message deleted." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not delete message.",
    };
  }
}

/**
 * Upload an attachment to the private message-attachments bucket,
 * then attach the path to an existing message the user owns.
 * Returns a short-lived signed URL for immediate display.
 */
export async function uploadMessageAttachment(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const messageId = String(formData.get("message_id") ?? "").trim();
    const file = formData.get("file") as File | null;

    if (!messageId) return { ok: false, error: "Message is required." };
    if (!file || file.size === 0) return { ok: false, error: "File is required." };
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return { ok: false, error: "File must be 5 MB or smaller." };
    }
    if (!ALLOWED_ATTACHMENT_MIME.includes(file.type as (typeof ALLOWED_ATTACHMENT_MIME)[number])) {
      return {
        ok: false,
        error: "Only JPEG, PNG, WebP images and PDF files are allowed.",
      };
    }

    // Extension parity with MIME (defence in depth; matches DB CHECK)
    const lowerName = (file.name || "").toLowerCase();
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    if (lowerName && !allowedExt.some((ext) => lowerName.endsWith(ext))) {
      return {
        ok: false,
        error: "File extension must be .jpg, .jpeg, .png, .webp, or .pdf.",
      };
    }

    const supabase = await createClient();

    // Verify ownership + membership via message row (RLS applies).
    const { data: msg, error: msgErr } = await supabase
      .from("messages")
      .select("id, sender_id, conversation_id")
      .eq("id", messageId)
      .maybeSingle();

    if (msgErr || !msg) return { ok: false, error: "Message not found." };
    if (msg.sender_id !== user.id) {
      return { ok: false, error: "You can only attach files to your own messages." };
    }

    const ext =
      file.type === "application/pdf"
        ? "pdf"
        : file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "jpg";
    const path = `${user.id}/${messageId}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("message-attachments")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (upErr) {
      logServerError("uploadMessageAttachment", upErr);
      return { ok: false, error: mapClientError(upErr, "Could not upload file.") };
    }

    const { error: insErr } = await supabase.from("message_attachments").insert({
      message_id: messageId,
      file_path: path,
      file_name: file.name.slice(0, 200),
      mime_type: file.type,
      file_size_bytes: file.size,
    });

    if (insErr) {
      // Best-effort cleanup of orphaned object
      await supabase.storage.from("message-attachments").remove([path]);
      logServerError("uploadMessageAttachment.insert", insErr);
      return { ok: false, error: mapClientError(insErr, "Could not save attachment.") };
    }

    const { data: signed } = await supabase.storage
      .from("message-attachments")
      .createSignedUrl(path, 60 * 10); // 10 minutes

    revalidatePath(`/buyer/messages/${msg.conversation_id}`);
    revalidatePath(`/seller/messages/${msg.conversation_id}`);

    return {
      ok: true,
      message: "Attachment uploaded.",
      signedUrl: signed?.signedUrl,
    };
  } catch (e) {
    logServerError("uploadMessageAttachment", e);
    return {
      ok: false,
      error: mapClientError(e, "Could not upload attachment."),
    };
  }
}

/**
 * Create a short-lived signed URL for an attachment the user may view.
 */
export async function getAttachmentSignedUrl(
  attachmentId: string
): Promise<ActionResult> {
  try {
    await requireAuth();
    const supabase = await createClient();

    const { data: att, error } = await supabase
      .from("message_attachments")
      .select("id, file_path")
      .eq("id", attachmentId)
      .maybeSingle();

    if (error || !att) return { ok: false, error: "Attachment not found." };

    const { data: signed, error: sErr } = await supabase.storage
      .from("message-attachments")
      .createSignedUrl(att.file_path, 60 * 10);

    if (sErr || !signed?.signedUrl) {
      return { ok: false, error: sErr?.message ?? "Could not sign URL." };
    }

    return { ok: true, signedUrl: signed.signedUrl };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not get download link.",
    };
  }
}
