"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GameLauncher } from "@/components/memory-game";
import { NAV_LINKS } from "@/lib/nav";
import { SIGNUP } from "@/lib/event";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
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
            render={
              <Link
                href={SIGNUP.externalUrl ?? "/#notify"}
                onClick={close}
                {...(SIGNUP.externalUrl
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              />
            }
            className="w-full brand-gradient-bg border-0 text-white hover:opacity-90"
          >
            Get notified
          </Button>
        </div>

        <div className="mt-3 px-4">
          <GameLauncher
            onOpen={close}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
