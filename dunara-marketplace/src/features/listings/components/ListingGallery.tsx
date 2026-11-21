"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NoPhoto } from "@/components/illustrations/NoPhoto";

type Photo = { id: string; url: string };

/** Main photo with a thumbnail strip, arrows and keyboard support. */
export function ListingGallery({ title, photos }: { title: string; photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const current = photos[Math.min(index, Math.max(count - 1, 0))];

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  return (
    <div>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] shadow-[0_1px_2px_rgb(24_37_31/.04)] sm:aspect-[16/11]"
        onKeyDown={(e) => {
          if (count < 2) return;
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        {current ? (
          <Image
            key={current.id}
            src={current.url}
            alt={`${title} — photo ${index + 1} of ${count}`}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <NoPhoto className="w-28 opacity-90" />
            <span className="text-sm text-[var(--color-ink-soft)]">No photo yet</span>
          </div>
        )}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="card-action absolute left-3 top-1/2 -translate-y-1/2"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="card-action absolute right-3 top-1/2 -translate-y-1/2"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-[#18251F]/75 px-2.5 py-1 text-xs font-semibold text-white" aria-hidden="true">
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <ul
          className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Listing photos"
        >
          {photos.map((m, i) => (
            <li key={m.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className="gallery-thumb block"
              >
                <Image
                  src={m.url}
                  alt=""
                  width={72}
                  height={72}
                  sizes="72px"
                  className="h-16 w-16 rounded-[.7rem] object-cover sm:h-[4.5rem] sm:w-[4.5rem]"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
