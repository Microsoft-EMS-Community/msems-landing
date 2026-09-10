"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { PHOTOS, fullSrc, thumbSrc } from "@/lib/photos";

/** Base row height the justified layout scales each row around. */
const ROW_HEIGHT = 210;

/**
 * Grid of every event photo, with a lightbox for viewing full size and
 * downloading.
 *
 * Laid out as justified rows rather than CSS columns. PHOTOS is in capture
 * order, and columns fill top-to-bottom, which would put the whole morning in
 * column one and restart at midday in column two. Flex wrapping fills
 * left-to-right, so the timeline reads the way people scan. Giving each tile a
 * flex-basis and flex-grow proportional to its aspect ratio makes every row
 * settle at a common height without cropping more than a few percent.
 *
 * Thumbnails are plain <img> on purpose: the files are pre-sized WebP
 * committed to public/, so routing them through next/image would burn Vercel
 * image-optimization quota to redo work already done.
 */
export function PhotoGallery() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);

  const open = useCallback((i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  }, []);

  const step = useCallback((delta: number) => {
    setIndex((current) => (current + delta + PHOTOS.length) % PHOTOS.length);
  }, []);

  // Warm the neighbouring full-size files so arrowing through feels instant.
  useEffect(() => {
    for (const delta of [1, -1]) {
      const neighbour = PHOTOS[(index + delta + PHOTOS.length) % PHOTOS.length];
      const preload = new window.Image();
      preload.src = fullSrc(neighbour.id);
    }
  }, [index]);

  const photo = PHOTOS[index];

  return (
    <>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {PHOTOS.map((item, i) => {
          const ratio = item.width / item.height;
          return (
          <button
            key={item.id}
            type="button"
            onClick={() => open(i)}
            aria-label={`Open photo ${i + 1} of ${PHOTOS.length}`}
            style={{ flexGrow: ratio, flexBasis: `${ratio * ROW_HEIGHT}px` }}
            className="group relative h-[150px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal sm:h-[210px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static pre-sized WebP, see component note */}
            <img
              src={thumbSrc(item.id)}
              alt={`Microsoft EMS Community Summit photo ${i + 1}`}
              width={item.width}
              height={item.height}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </button>
          );
        })}
        {/* Absorbs the leftover width so the final row keeps its scale
            instead of stretching a few photos across the whole page. */}
        {Array.from({ length: 6 }, (_, i) => (
          <i key={i} aria-hidden className="h-0 grow-[10] basis-[300px]" />
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
        className="m-auto max-h-[94vh] w-[min(96vw,72rem)] rounded-2xl border border-white/15 bg-background p-0 backdrop:bg-black/85"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
          <p className="text-sm text-muted-foreground">
            {index + 1} / {PHOTOS.length}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={fullSrc(photo.id)}
              download={`${photo.id}.jpg`}
              className="inline-flex items-center gap-2 rounded-lg brand-gradient-bg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              <Download className="size-3.5" />
              Download
            </a>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element -- full-size download asset, shown at its native ratio */}
          <img
            src={fullSrc(photo.id)}
            alt={`Microsoft EMS Community Summit photo ${index + 1}`}
            width={photo.width}
            height={photo.height}
            className="max-h-[82vh] w-auto max-w-full object-contain"
          />

          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous photo"
            className="absolute left-2 grid size-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next photo"
            className="absolute right-2 grid size-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </dialog>
    </>
  );
}
