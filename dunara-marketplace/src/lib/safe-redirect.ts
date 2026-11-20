/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Blocks protocol-relative, scheme-relative, and external URLs.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback = "/seller"
): string {
  if (!candidate || typeof candidate !== "string") return fallback;
  const path = candidate.trim();
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("://")) return fallback;
  if (path.includes("\\")) return fallback;
  if (path.includes("@")) return fallback;
  // Disallow control characters / whitespace in path
  if (/[\s\x00-\x1f]/.test(path)) return fallback;
  // Limit length
  if (path.length > 512) return fallback;
  return path;
}
