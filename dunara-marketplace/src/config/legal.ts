/**
 * Legal details — single source of truth for the Terms and Privacy pages.
 * Replace every [bracketed] value before launch. Do not publish with brackets.
 */
export const legal = {
  operatorName: "Lumeriq Designs",
  registrationNumber: "[CAC registration number / business name registration]",
  registeredAddress: "[Registered business address], Nigeria",
  email: "lumeriqdesigns@gmail.com",
  whatsappDisplay: "09031512760",
  /** Email for data protection requests (can be the same as general email). */
  privacyEmail: "lumeriqdesigns@gmail.com",
  dpoName: "[Data Protection Officer name or “Data Protection Contact”]",
  /** City / State whose courts have jurisdiction (see Terms, governing law). */
  courtsLocation: "[State]",
  arbitrationSeat: "[City], Nigeria",
  termsEffectiveDate: "20 November 2026",
  privacyEffectiveDate: "20 November 2026",
} as const;
