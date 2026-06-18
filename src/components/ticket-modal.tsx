"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { EVENT } from "@/lib/event";

const SHOP_URL = "https://shop.weeztix.com/51630dc4-8c23-11ed-aa54-6a57c78572ab";

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Popout ticket shop. The shop is a plain iframe (loads on shop.weeztix.com,
 * same-origin to itself, no parent CORS). The shop runs the iframe-resizer
 * child, so we attach its parent and use heightCalculationMethod "lowestElement"
 * to size the iframe to the real content (no trailing whitespace), letting the
 * whole modal scroll as one.
 */
export function TicketModal({ open, onClose }: TicketModalProps) {
  const [mounted, setMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Attach iframe-resizer once the iframe is mounted, so it auto-sizes to the
  // shop's actual content height.
  useEffect(() => {
    if (!mounted) return;
    const el = iframeRef.current;
    if (!el) return;
    let cancelled = false;
    import("iframe-resizer/js/iframeResizer")
      .then(({ default: iframeResize }) => {
        if (!cancelled) {
          iframeResize(
            { checkOrigin: false, heightCalculationMethod: "lowestElement", log: false },
            el,
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      (el as unknown as { iFrameResizer?: { close: () => void } }).iFrameResizer?.close?.();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden={!open}
      onClick={onClose}
      className={`fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm transition-opacity sm:p-6 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-4 w-full max-w-2xl rounded-2xl border border-white/10 bg-card shadow-2xl sm:my-8"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-white/10 bg-card/95 px-4 py-3 backdrop-blur">
          <h2 className="text-base font-bold">Get your ticket</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-3 sm:p-4">
          <iframe
            ref={iframeRef}
            src={SHOP_URL}
            title="Ticket shop"
            allow="payment"
            style={{ minHeight: 600 }}
            className="w-full rounded-xl bg-background"
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Trouble loading?{" "}
            <a
              href={EVENT.ticketsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Open the shop in a new tab
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
