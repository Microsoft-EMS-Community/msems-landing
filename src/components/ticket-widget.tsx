"use client";

import Script from "next/script";

// Weeztix / OpenTicket shop. The injector script finds the `.ot-iframe` div by
// its data attributes and injects the live, auto-resizing ticket-shop iframe.
const SHOP_URL = "https://shop.weeztix.com/51630dc4-8c23-11ed-aa54-6a57c78572ab";
const SHOP_GUID = "51630dc4-8c23-11ed-aa54-6a57c78572ab";

export function TicketWidget() {
  return (
    <div className="min-h-[600px]">
      <div className="ot-iframe" data-ot-url={SHOP_URL} data-ot-guid={SHOP_GUID} />
      <Script
        src="https://v1.widget.shop.weeztix.com/injector.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
