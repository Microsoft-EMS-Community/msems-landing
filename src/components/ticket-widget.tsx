"use client";

import Script from "next/script";

// Official Weeztix embed: integrate.js (served from the shop's own origin)
// builds an iframe that loads the shop in-frame, so checkout/Turnstile/cookies
// all run on shop.weeztix.com and there's no cross-origin CORS from our page.
const SHOP_URL = "https://shop.weeztix.com/51630dc4-8c23-11ed-aa54-6a57c78572ab";

export function TicketWidget() {
  return (
    <div className="min-h-[600px]">
      <div id="shop-frame" data-url={SHOP_URL} style={{ maxWidth: 600, margin: "0 auto" }} />
      <Script
        src="https://shop.weeztix.com/build/integrate.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
