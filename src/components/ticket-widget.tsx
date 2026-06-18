// The ticket shop as a plain iframe: it loads on shop.weeztix.com inside the
// frame, so its OpenTicket/Turnstile/cookie calls are same-origin to it (no
// parent CORS/CSP issues). We only allow framing it (frame-src in next.config).
const SHOP_URL = "https://shop.weeztix.com/51630dc4-8c23-11ed-aa54-6a57c78572ab";

export function TicketWidget() {
  return (
    <iframe
      src={SHOP_URL}
      title="Ticket shop"
      loading="lazy"
      allow="payment"
      className="mx-auto block h-[75vh] w-full max-w-[600px] rounded-xl bg-white"
    />
  );
}
