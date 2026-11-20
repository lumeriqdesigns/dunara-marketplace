/**
 * Browser-side image compression so most phone photos fit the upload limit
 * (see upload-limits.ts). Client-only: uses canvas. PDFs and GIFs are returned
 * unchanged (GIFs may be animated; callers still enforce the size limit).
 */
import { MAX_UPLOAD_BYTES } from "@/lib/upload-limits";

export type CompressOptions = {
  maxBytes?: number;
  /** Longest side of the first attempt, in px. */
  maxDimension?: number;
  /** Smallest longest-side we will shrink to before giving up, in px. */
  minDimension?: number;
  /**
   * Allow WebP output for PNG input (keeps transparency, e.g. logos).
   * Set false where WebP is not an accepted type (verification documents).
   */
  allowWebp?: boolean;
};

const COMPRESSIBLE = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Scale (w,h) so the longest side is at most `max`, never upscaling. */
export function fitWithin(w: number, h: number, max: number): { width: number; height: number } {
  const longest = Math.max(w, h);
  if (longest <= max) return { width: w, height: h };
  const ratio = max / longest;
  return { width: Math.max(1, Math.round(w * ratio)), height: Math.max(1, Math.round(h * ratio)) };
}

export function extensionFor(type: string): string {
  return type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
}

export function renameWithExtension(name: string, type: string): string {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  return `${base}.${extensionFor(type)}`;
}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => {} };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Returns a file at or under `maxBytes` when possible. If the file is already
 * small enough, is not a compressible image, or cannot be shrunk enough, the
 * best result (possibly the original) is returned: callers must still check size.
 */
export async function compressImageToLimit(file: File, opts: CompressOptions = {}): Promise<File> {
  const maxBytes = opts.maxBytes ?? MAX_UPLOAD_BYTES;
  const allowWebp = opts.allowWebp ?? true;
  const minDimension = opts.minDimension ?? 800;
  let dimension = opts.maxDimension ?? 2000;

  if (file.size <= maxBytes || !COMPRESSIBLE.has(file.type)) return file;
  if (typeof document === "undefined") return file;

  let decoded: Awaited<ReturnType<typeof decode>>;
  try {
    decoded = await decode(file);
  } catch {
    return file;
  }

  // PNG/WebP may carry transparency: keep it via WebP when allowed, else flatten to white JPEG.
  const outType = file.type === "image/jpeg" || !allowWebp ? "image/jpeg" : "image/webp";
  let best: Blob | null = null;

  try {
    while (true) {
      const { width, height } = fitWithin(decoded.width, decoded.height, dimension);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      if (outType === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(decoded.source, 0, 0, width, height);

      for (const quality of [0.85, 0.75, 0.65, 0.55]) {
        const blob = await toBlob(canvas, outType, quality);
        if (!blob) return file;
        // Safari cannot encode WebP and silently returns PNG; retry as JPEG.
        if (blob.type !== outType) {
          return compressImageToLimit(file, { ...opts, allowWebp: false });
        }
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= maxBytes) {
          return new File([blob], renameWithExtension(file.name, outType), {
            type: outType,
            lastModified: Date.now(),
          });
        }
      }

      if (dimension <= minDimension) break;
      dimension = Math.max(minDimension, Math.round(dimension * 0.8));
    }
  } finally {
    decoded.close();
  }

  if (best && best.size < file.size) {
    return new File([best], renameWithExtension(file.name, outType), {
      type: outType,
      lastModified: Date.now(),
    });
  }
  return file;
}
