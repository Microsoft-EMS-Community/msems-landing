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
 * Popout ticket shop. Plain iframe (loads on shop.weeztix.com, same-origin to
 * itself, no parent CORS). The shop runs the iframe-resizer child, so we attach
 * its parent on load (when the shop is ready, so the handshake succeeds) with
 * heightCalculationMethod "lowestElement" to size to real content. A viewport
 * min-height keeps it from collapsing if resizing is slow/unavailable.
 */
export function TicketModal({ open, onClose }: TicketModalProps) {
  const [mounted, setMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const attached = useRef(false);

  // Lock the background while open using the position-fixed technique. Plain
  // `body { overflow: hidden }` leaves mobile (iOS Safari) needing a second
  // swipe to re-engage scrolling after close; pinning the body and restoring
  // the exact scroll position avoids that.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  function handleLoad() {
    if (attached.current) return;
    const el = iframeRef.current;
    if (!el) return;
    attached.current = true;
    import("iframe-resizer/js/iframeResizer")
      .then(({ default: iframeResize }) => {
        iframeResize(
          { checkOrigin: false, heightCalculationMethod: "lowestElement", log: false },
          el,
        );
      })
      .catch(() => {});
  }

  if (!mounted) return null;

  return (
    <div
      aria-hidden={!open}
      onClick={onClose}
      className={`fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/70 p-3 backdrop-blur-sm transition-opacity sm:p-6 ${
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
            onLoad={handleLoad}
            style={{ minHeight: "80vh" }}
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
