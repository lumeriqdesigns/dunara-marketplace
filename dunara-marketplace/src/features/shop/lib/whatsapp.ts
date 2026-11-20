/**
 * Build a safe wa.me URL with prefilled message.
 */
export function buildWhatsAppUrl(
  phoneNormalized: string,
  message: string
): string {
  const digits = phoneNormalized.replace(/\D/g, "");
  if (!digits) {
    throw new Error("Invalid phone for WhatsApp URL");
  }
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

export function shopWhatsAppMessage(shopName: string): string {
  return `Hi! I found your shop "${shopName}" on Dunara and I'd like to know more.`;
}
