"use client";

import { useRef } from "react";
import { X } from "lucide-react";

interface BillLightboxProps {
  readonly src: string;
  readonly label: string;
}

/**
 * Opens a bill scan in a lightbox instead of a new tab. Native <dialog>
 * handles Escape, focus and the backdrop; clicking outside closes it.
 */
export function BillLightbox({ src, label }: BillLightboxProps) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="mt-1.5 inline-block text-sm font-medium text-brand-teal underline underline-offset-4 transition-colors hover:text-brand-pink"
      >
        {label} →
      </button>

      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto max-h-[90vh] w-[min(92vw,56rem)] rounded-2xl border border-white/15 bg-background p-0 backdrop:bg-black/80"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <div className="flex items-center gap-3">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              Open original
            </a>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- bill scans are ad-hoc sizes; plain img keeps them exact */}
        <img
          src={src}
          alt={label}
          className="max-h-[80vh] w-full overflow-auto bg-white object-contain"
        />
      </dialog>
    </>
  );
}
