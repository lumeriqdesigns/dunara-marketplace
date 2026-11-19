/**
 * Generate a URL-safe slug from a shop name.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 60);
}

/**
 * Append a short suffix for uniqueness when base slug is taken.
 */
export function withSlugSuffix(base: string, attempt: number): string {
  const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
  const maxBase = 60 - suffix.length;
  return `${base.slice(0, maxBase)}${suffix}`;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2 && slug.length <= 60;
}
