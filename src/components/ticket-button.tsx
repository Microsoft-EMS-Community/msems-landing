"use client";

import { Ticket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/components/tickets-provider";

interface TicketButtonProps {
  label?: string;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  arrow?: boolean;
}

/** Opens the popout ticket shop. Styled via className like a normal Button. */
export function TicketButton({
  label = "Get your ticket",
  className,
  variant = "default",
  size = "lg",
  arrow = true,
}: TicketButtonProps) {
  const openTickets = useTickets();
  return (
    <Button onClick={openTickets} size={size} variant={variant} className={className}>
      <Ticket className="size-4" />
      {label}
      {arrow && <ArrowRight className="size-4" />}
    </Button>
  );
}
