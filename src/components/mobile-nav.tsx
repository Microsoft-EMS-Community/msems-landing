"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Ticket } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GamesLauncher } from "@/components/games-provider";
import { useTickets } from "@/components/tickets-provider";
import { NAV_LINKS } from "@/lib/nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const openTickets = useTickets();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={openTickets}
        aria-label="Get your ticket"
        className="inline-flex size-10 items-center justify-center rounded-lg brand-gradient-bg text-white transition-opacity hover:opacity-90"
      >
        <Ticket className="size-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              aria-label="Open menu"
              className="inline-flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-foreground transition-colors hover:bg-white/10"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>

      <SheetContent
        side="right"
        className="w-72 border-white/10 bg-background/95 backdrop-blur-xl"
      >
        <SheetTitle className="px-4 pt-4">Menu</SheetTitle>

        <nav className="mt-2 flex flex-col px-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-lg px-3 py-3 text-base text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-2 px-4">
          <Button
            onClick={() => {
              close();
              openTickets();
            }}
            className="w-full brand-gradient-bg border-0 text-white hover:opacity-90"
          >
            <Ticket className="size-4" />
            Get tickets
          </Button>
        </div>

        <div className="mt-3 px-4">
          <GamesLauncher
            onOpen={close}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          />
        </div>
      </SheetContent>
      </Sheet>
    </div>
  );
}
