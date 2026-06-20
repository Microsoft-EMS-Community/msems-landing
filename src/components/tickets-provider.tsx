"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { TicketModal } from "@/components/ticket-modal";

const TicketsContext = createContext<(() => void) | null>(null);

export function useTickets(): () => void {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used within TicketsProvider");
  return ctx;
}

/** Provides openTickets() to any CTA and renders the single popout shop modal. */
export function TicketsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openTickets = useCallback(() => setOpen(true), []);
  const closeTickets = useCallback(() => setOpen(false), []);
  return (
    <TicketsContext.Provider value={openTickets}>
      {children}
      <TicketModal open={open} onClose={closeTickets} />
    </TicketsContext.Provider>
  );
}
