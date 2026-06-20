import { Check, HandHeart, Plus, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TicketButton } from "@/components/ticket-button";
import { TicketBreakdown } from "@/components/ticket-breakdown";
import { EVENT, PRICING, allInPrice } from "@/lib/event";

export function Pricing() {
  const { currency, socialAddon } = PRICING;

  return (
    <section
      id="tickets"
      className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-20 sm:px-6"
    >
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-teal">
            <HandHeart className="size-3.5" />
            Not for profit · run at cost
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tickets
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          A not-for-profit event with {PRICING.totalSeats} seats, priced only to
          cover the day, never to make money. Early birds get the best rate, so
          grab a seat soon.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
        {PRICING.tiers.map((tier) => (
          <div
            key={tier.id}
            className={`reveal relative flex flex-col overflow-hidden rounded-3xl border p-7 ${
              tier.featured
                ? "border-brand-pink/40 bg-brand-pink/[0.05]"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {tier.featured && (
              <div className="absolute inset-x-0 top-0 h-1 brand-gradient-bg" />
            )}

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-lg font-semibold">
                {tier.featured && <Zap className="size-4 text-brand-pink" />}
                {tier.name}
              </span>
              {tier.badge && (
                <Badge
                  variant="secondary"
                  className="border border-brand-pink/30 bg-brand-pink/10 text-xs font-medium text-brand-pink"
                >
                  {tier.badge}
                </Badge>
              )}
            </div>

            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-5xl font-bold tracking-tight">
                {currency}
                {allInPrice(tier.price)}
              </span>
              <span className="text-sm text-muted-foreground">/ ticket</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Includes VAT and all booking fees
            </p>

            <div className="my-6 h-px bg-white/10" />

            <ul className="flex flex-1 flex-col gap-3 text-sm">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <Check className="size-4 shrink-0 text-brand-teal" />
                  {feature}
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Plus className="size-4 shrink-0 text-brand-purple" />
                <span>
                  {socialAddon.label}{" "}
                  <span className="font-medium text-foreground">
                    +{currency}
                    {allInPrice(socialAddon.price)}
                  </span>{" "}
                  (optional)
                </span>
              </li>
            </ul>

            <TicketButton
              label="Get tickets"
              variant={tier.featured ? "default" : "outline"}
              className={
                tier.featured
                  ? "mt-7 brand-gradient-bg border-0 text-white hover:opacity-90"
                  : "mt-7 border border-white/15 bg-white/5 hover:bg-white/10"
              }
            />
          </div>
        ))}
      </div>

      <TicketBreakdown />

      <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted-foreground">
        {socialAddon.description}{" "}
        {!PRICING.pricesFinal && <span>{PRICING.note}</span>} This is a
        not-for-profit, community-run event powered by {EVENT.venue}. Tickets are
        sold via Weeztix; see our{" "}
        <a
          href="/policies"
          className="underline underline-offset-2 hover:text-foreground"
        >
          ticket terms &amp; refund policy
        </a>
        .
      </p>

      <p className="mx-auto mt-6 max-w-md text-balance text-center text-sm text-muted-foreground">
        Need sign-off?{" "}
        <a
          href="/convince"
          className="font-medium text-brand-pink underline underline-offset-4 transition-colors hover:text-brand-purple"
        >
          Convince your boss with a{" "}
          <span className="whitespace-nowrap">ready-made letter →</span>
        </a>
      </p>
    </section>
  );
}
