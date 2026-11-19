/** AI usage period helpers — Africa/Lagos calendar month. */

export function currentPeriodStart(now: Date = new Date()): string {
  const lagos = new Date(now.getTime() + 60 * 60 * 1000);
  const y = lagos.getUTCFullYear();
  const m = String(lagos.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function nextPeriodStart(periodStart: string): string {
  const [y, m] = periodStart.split("-").map(Number);
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  return `${nextY}-${String(nextM).padStart(2, "0")}-01`;
}

export function formatPeriodLabel(periodStart: string): string {
  const [y, m] = periodStart.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date.toLocaleDateString("en-NG", { month: "long", year: "numeric", timeZone: "UTC" });
}
