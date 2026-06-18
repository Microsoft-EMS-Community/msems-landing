import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TicketWidget } from "@/components/ticket-widget";
import { Button } from "@/components/ui/button";
import { EVENT, PRICING } from "@/lib/event";

export const metadata: Metadata = {
  title: "Tickets | Microsoft EMS Community Summit",
  description:
    "Get your ticket for the Microsoft EMS Community Summit, Friday September 4th 2026, near Copenhagen.",
};

export default function TicketsPage() {
  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Get your <span className="brand-gradient-text">ticket</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            {EVENT.dateLabel} · {EVENT.venue}, {EVENT.venueArea}. From{" "}
            {PRICING.currency}
            {PRICING.tiers[0].price}. Seats are limited.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
          <TicketWidget />
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Trouble loading?{" "}
          <a
            href={EVENT.ticketsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Open the shop in a new tab
          </a>
          . Secure checkout by Weeztix.
        </p>

        <div className="mt-12 text-center">
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
