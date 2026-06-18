import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Ticket, Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { EVENT, PRICING } from "@/lib/event";

export const metadata: Metadata = {
  title: "Tickets | Microsoft EMS Community Summit",
  description:
    "Get your ticket for the Microsoft EMS Community Summit, Friday September 4th 2026, near Copenhagen.",
};

const INCLUDED = [
  "Full day of community-led sessions",
  "CloudHour round-table & speaker AMA",
  "Lunch, drinks & beverages",
];

export default function TicketsPage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-4 pb-20 pt-16 text-center sm:px-6">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl brand-gradient-bg">
          <Ticket className="size-8 text-white" />
        </span>
        <h1 className="mt-8 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Get your <span className="brand-gradient-text">ticket</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}. Early bird{" "}
          {PRICING.currency}
          {PRICING.tiers[0].price}, then {PRICING.currency}
          {PRICING.tiers[1].price} (incl. VAT). Seats are limited.
        </p>

        <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-3 text-left">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm">
              <Check className="size-4 shrink-0 text-brand-teal" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Button
            render={
              <a
                href={EVENT.ticketsUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            size="lg"
            className="sheen brand-gradient-bg border-0 px-8 text-base text-white hover:opacity-90"
          >
            <Ticket className="size-4" />
            Get your ticket
            <ArrowRight className="size-4" />
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Opens our ticket shop in a new tab. Secure checkout by Weeztix.
          </p>
        </div>

        <div className="mt-12">
          <Button
            render={<Link href="/" />}
            variant="outline"
            className="border-white/15 bg-white/5 hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
            Back to the Summit
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
