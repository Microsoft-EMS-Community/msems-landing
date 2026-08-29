"use client";

import { Ticket, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/components/tickets-provider";
import { isSoldOut } from "@/lib/event";

interface TicketButtonProps {
  label?: string;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  arrow?: boolean;
}

/**
 * Opens the popout ticket shop. Styled via className like a normal Button.
 * Once the event is sold out it becomes an inert "Sold out" marker, so every
 * CTA on the site flips at once.
 */
export function TicketButton({
  label = "Get your ticket",
  className,
  variant = "default",
  size = "lg",
  arrow = true,
}: TicketButtonProps) {
  const openTickets = useTickets();
  if (isSoldOut()) {
    return (
      <Button
        disabled
        size={size}
        variant={variant}
        className={`${className ?? ""} disabled:opacity-100 saturate-50`}
        aria-disabled="true"
      >
        <Check className="size-4" />
        Sold out
      </Button>
    );
  }
  return (
    <Button onClick={openTickets} size={size} variant={variant} className={className}>
      <Ticket className="size-4" />
      {label}
      {arrow && <ArrowRight className="size-4" />}
    </Button>
  );
}
