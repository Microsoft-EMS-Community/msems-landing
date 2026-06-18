"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { EVENT } from "@/lib/event";

const SHOP_URL = "https://shop.weeztix.com/51630dc4-8c23-11ed-aa54-6a57c78572ab";
// Fallback height if the shop doesn't post a resize message; sized to fit the
// first step so there's no inner scrollbar, the whole modal scrolls instead.
const DEFAULT_HEIGHT = 1450;

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Popout ticket shop. The shop is a plain iframe (loads on shop.weeztix.com,
 * same-origin to itself, no parent CORS). The iframe auto-sizes to the shop's
 * content height when it posts a resize message, so the whole modal scrolls as
 * one rather than a small scrollbox inside it.
 */
export function TicketModal({ open, onClose }: TicketModalProps) {
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

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

  // Auto-size the iframe from the shop's resize messages (best-effort).
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!/(weeztix\.com|openticket\.tech)$/.test(new URL(e.origin).hostname)) {
        return;
      }
      const data = e.data as unknown;
      let h: unknown;
      if (typeof data === "number") h = data;
      else if (data && typeof data === "object") {
        const o = data as Record<string, unknown>;
        const payload = o.payload as Record<string, unknown> | undefined;
        h = o.height ?? o.frameHeight ?? o.iframeHeight ?? payload?.height;
      }
      if (typeof h === "number" && h > 300 && h < 8000) setHeight(Math.ceil(h));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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
            src={SHOP_URL}
            title="Ticket shop"
            allow="payment"
            style={{ height }}
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
