/**
 * Safe search helpers for public marketplace queries.
 * Never pass raw user input into PostgREST `.or()` strings without sanitising.
 */

const MAX_SEARCH_LEN = 100;

/**
 * Strip characters that break PostgREST filter syntax or act as LIKE wildcards
 * from user-controlled search terms. Caps length.
 */
export function sanitiseSearchTerm(input: string | null | undefined): string {
  if (!input) return "";
  let term = input.trim().slice(0, MAX_SEARCH_LEN);
  // Remove PostgREST filter metacharacters and control chars
  term = term.replace(/[,()\\]/g, " ");
  // Escape LIKE wildcards so % and _ are literal
  term = term.replace(/[%_]/g, " ");
  // Collapse whitespace
  term = term.replace(/\s+/g, " ").trim();
  return term;
}

export function sanitiseLocationTerm(input: string | null | undefined): string {
  return sanitiseSearchTerm(input);
}

/**
 * Build a safe ilike pattern (adds % only after sanitisation).
 */
export function ilikeContains(term: string): string {
  const safe = sanitiseSearchTerm(term);
  if (!safe) return "";
  return `%${safe}%`;
}

/**
 * Build a PostgREST `or` clause for ilike on multiple columns.
 * Patterns are sanitised and double-quoted so spaces do not break parsing.
 */
export function orIlikeClause(columns: string[], rawTerm: string): string | null {
  const pattern = ilikeContains(rawTerm);
  if (!pattern) return null;
  // Double-quote the pattern for PostgREST (handles spaces)
  const quoted = `"${pattern.replace(/"/g, "")}"`;
  return columns.map((col) => `${col}.ilike.${quoted}`).join(",");
}
