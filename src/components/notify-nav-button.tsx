"use client";

import { type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { SIGNUP } from "@/lib/event";

// Roughly the sticky header height, so scrolled-to forms aren't hidden under it.
const HEADER_OFFSET = 80;

/**
 * Header "Get notified" button. If an external signup URL is configured it
 * links out; otherwise it smart-scrolls to whichever on-page signup form is
 * relevant: the hero form while you're near the top, the bottom form once
 * you've scrolled past it.
 */
export function NotifyNavButton() {
  const externalHref = SIGNUP.externalUrl;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (externalHref) return; // external link navigates normally
    event.preventDefault();

    const top = document.getElementById("signup-top");
    const bottom = document.getElementById("notify");
    const target =
      top && top.getBoundingClientRect().bottom > HEADER_OFFSET
        ? top
        : (bottom ?? top);
    if (!target) return;

    const y =
      target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <Button
      render={
        externalHref ? (
          <a href={externalHref} target="_blank" rel="noopener noreferrer" />
        ) : (
          <a href="#notify" onClick={handleClick} />
        )
      }
      className="brand-gradient-bg border-0 text-white hover:opacity-90"
    >
      Get notified
    </Button>
  );
}
