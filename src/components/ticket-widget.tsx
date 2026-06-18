"use client";

import { useRef } from "react";

// The ticket shop as a plain iframe (loads on shop.weeztix.com inside the
// frame, no parent CORS). The shop runs iframe-resizer's child, so we attach
// its parent on load to auto-size the iframe to the real content height.
const SHOP_URL = "https://shop.weeztix.com/51630dc4-8c23-11ed-aa54-6a57c78572ab";

export function TicketWidget() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const attached = useRef(false);

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

  return (
    <iframe
      ref={iframeRef}
      src={SHOP_URL}
      title="Ticket shop"
      allow="payment"
      onLoad={handleLoad}
      style={{ minHeight: "80vh" }}
      className="mx-auto block w-full max-w-[600px] rounded-xl bg-background"
    />
  );
}
