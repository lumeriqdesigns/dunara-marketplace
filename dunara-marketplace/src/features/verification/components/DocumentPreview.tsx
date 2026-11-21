"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, ZoomIn, ZoomOut, X } from "lucide-react";

type Doc = { path: string; signedUrl: string; expiresIn: number };

function isImagePath(path: string) {
  const lower = path.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
}

function isPdfPath(path: string) {
  return path.toLowerCase().endsWith(".pdf");
}

/** Image or PDF card with lightbox zoom for images. Decorative chrome only — no server changes. */
export function DocumentPreview({ documents }: { documents: Doc[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const close = useCallback(() => {
    setLightbox(null);
    setZoom(1);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, close]);

  if (documents.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-8 text-center text-sm text-[var(--color-ink-soft)]">
        No documents available (missing files or signing failed).
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-4">
        {documents.map((doc, i) => {
          const image = isImagePath(doc.path);
          const pdf = isPdfPath(doc.path);
          return (
            <li
              key={doc.path}
              className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface-warm)] px-4 py-2.5">
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  Document {i + 1}
                  {pdf ? " · PDF" : image ? " · Image" : ""}
                </p>
                <a
                  href={doc.signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Open secure link
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </div>
              <div className="bg-[var(--color-canvas)] p-3">
                {image ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLightbox(doc.signedUrl);
                      setZoom(1);
                    }}
                    className="group relative block w-full overflow-hidden rounded-xl border border-[var(--color-border)] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    aria-label={`Zoom document ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={doc.signedUrl}
                      alt=""
                      className="mx-auto max-h-72 w-full object-contain transition group-hover:opacity-95"
                    />
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-lg bg-[var(--color-ink)]/80 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                      <ZoomIn aria-hidden="true" className="size-3.5" />
                      Zoom
                    </span>
                  </button>
                ) : pdf ? (
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-10">
                    <FileText aria-hidden="true" className="size-10 text-[var(--color-primary)]" />
                    <p className="text-sm text-[var(--color-ink-soft)]">PDF document</p>
                    <a
                      href={doc.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
                    >
                      Open PDF preview
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-8">
                    <FileText aria-hidden="true" className="size-8 text-[var(--color-ink-soft)]" />
                    <a
                      href={doc.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      Open file
                    </a>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Document zoom"
          className="fixed inset-0 z-50 flex flex-col bg-[var(--color-ink)]/90"
          onClick={close}
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                aria-label="Zoom out"
              >
                <ZoomOut aria-hidden="true" className="size-5" />
              </button>
              <span className="min-w-[3.5rem] text-center text-sm font-medium tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                aria-label="Zoom in"
              >
                <ZoomIn aria-hidden="true" className="size-5" />
              </button>
            </div>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
              onClick={close}
              aria-label="Close"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto p-4" onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox}
              alt=""
              className="max-h-none origin-center transition-transform duration-150"
              style={{ transform: `scale(${zoom})` }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
