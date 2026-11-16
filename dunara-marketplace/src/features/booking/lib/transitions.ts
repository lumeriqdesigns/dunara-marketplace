/**
 * UI mirror only. PostgreSQL booking_transition / booking_transition_allowed
 * is the authoritative source of truth.
 *
 * Product rules (V1):
 * - Seller owns quotation, confirmation and delivery progression.
 * - Buyer responds to quotes and may cancel or raise a dispute.
 * - Exit from `disputed` is admin-only (enforced in the RPC, not in this matrix).
 * - Preferred date/time windows are advisory; no formal scheduled_* column yet.
 */
export type BookingStatus =
  | "requested"
  | "quoted"
  | "accepted"
  | "awaiting_confirmation"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "declined"
  | "cancelled"
  | "disputed";

const edges: Record<BookingStatus, BookingStatus[]> = {
  requested: ["quoted", "accepted", "declined", "cancelled", "disputed"],
  quoted: ["accepted", "declined", "cancelled", "disputed"],
  accepted: ["awaiting_confirmation", "confirmed", "cancelled", "disputed"],
  awaiting_confirmation: ["confirmed", "cancelled", "disputed"],
  confirmed: ["in_progress", "cancelled", "disputed"],
  in_progress: ["completed", "cancelled", "disputed"],
  completed: [],
  declined: [],
  cancelled: [],
  // Matrix allows these targets; the RPC additionally requires is_admin()
  disputed: ["confirmed", "in_progress", "completed", "cancelled"],
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return edges[from]?.includes(to) ?? false;
}
