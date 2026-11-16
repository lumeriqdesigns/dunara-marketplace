export type NotificationChannel = "in_app" | "email" | "push" | "telegram";

export type NotificationEventType =
  | "new_booking"
  | "booking_status"
  | "booking_accepted"
  | "booking_declined"
  | "new_quotation"
  | "quotation_accepted"
  | "booking_rescheduled"
  | "booking_completed"
  | "new_message"
  | "verification_result"
  | "verification_approved"
  | "verification_rejected"
  | "new_review"
  | "marketing"
  | "promo";

export type DeliveryStatus = "pending" | "delivered" | "failed" | "skipped";

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  channel: NotificationChannel;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  dedupe_key?: string | null;
  delivery_status?: DeliveryStatus;
};

export type NotificationPreferences = {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  telegram_enabled: boolean;
  marketing_enabled: boolean;
  booking_updates: boolean;
  message_updates: boolean;
  verification_updates: boolean;
  review_updates: boolean;
  marketing_email: boolean;
};

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};
