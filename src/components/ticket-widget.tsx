"use client";

import { useEffect, useRef } from "react";

// The ticket shop as a plain iframe (loads on shop.weeztix.com inside the
// frame, no parent CORS). The shop runs iframe-resizer's child, so we attach
// its parent to auto-size the iframe to the real content height.
const SHOP_URL = "https://shop.weeztix.com/51630dc4-8c23-11ed-aa54-6a57c78572ab";

export function TicketWidget() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={SHOP_URL}
      title="Ticket shop"
      allow="payment"
      style={{ minHeight: 600 }}
      className="mx-auto block w-full max-w-[600px] rounded-xl bg-background"
    />
  );
}
