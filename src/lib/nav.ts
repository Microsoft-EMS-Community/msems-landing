export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/#agenda", label: "Agenda" },
  { href: "/#speakers", label: "Speakers" },
  { href: "/venue", label: "Venue" },
  { href: "/#tickets", label: "Tickets" },
  { href: "/#team", label: "Team" },
  { href: "/#faq", label: "FAQ" },
];
