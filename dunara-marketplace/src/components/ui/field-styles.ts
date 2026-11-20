/**
 * Single source of truth for text-field styling (Input, Textarea, Select, and raw inputs).
 * Keep colours on CSS variables so they follow the brand tokens in globals.css.
 */
export const fieldBase =
  "w-full rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-ink)] " +
  "shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] placeholder:text-[#9AA39B] " +
  "transition-[border-color,box-shadow,background-color] duration-200 " +
  "hover:border-[#C5D2C8] " +
  "focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12 " +
  "disabled:cursor-not-allowed disabled:bg-[#F4F5EF] disabled:opacity-60 " +
  "aria-[invalid=true]:border-[var(--color-error)] aria-[invalid=true]:focus-visible:ring-[var(--color-error)]/15";
