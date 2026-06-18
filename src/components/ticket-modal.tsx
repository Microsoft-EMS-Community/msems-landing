"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { EVENT } from "@/lib/event";

const SHOP_URL = "https://shop.weeztix.com/51630dc4-8c23-11ed-aa54-6a57c78572ab";

interface TicketModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Popout ticket shop. Lazily mounts the official Weeztix embed on first open
 * and keeps it mounted (toggling visibility) so re-opening is instant and the
 * shop state is preserved. The shop loads in-frame on shop.weeztix.com.
 */
export function TicketModal({ open, onClose }: TicketModalProps) {
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) return null;

  return (
    <div
      aria-hidden={!open}
      onClick={onClose}
      className={`fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm transition-opacity sm:p-6 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-card p-4 shadow-2xl sm:my-10 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Get your ticket</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <iframe
          src={SHOP_URL}
          title="Ticket shop"
          allow="payment"
          className="mx-auto block h-[72vh] w-full max-w-[600px] rounded-xl bg-white"
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
  );
}
