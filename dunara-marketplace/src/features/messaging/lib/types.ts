export type ConversationSummary = {
  id: string;
  subject: string | null;
  booking_id: string | null;
  last_message_at: string | null;
  updated_at: string;
  unread_count: number;
  other_display_name: string | null;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  is_system: boolean;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  sender_display_name?: string | null;
};

export type AttachmentRow = {
  id: string;
  message_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
  signed_url?: string | null;
};

export const ALLOWED_ATTACHMENT_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MiB
