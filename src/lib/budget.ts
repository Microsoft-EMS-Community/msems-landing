/**
 * The open books: what came in, what went out, and what the leftover buys.
 * Income is native EUR (that is what the shop charges); bills are native DKK
 * (that is what Danish vendors invoice). Conversions use the krone peg.
 * All amounts include 25% VAT so the two sides compare fairly. Update
 * statuses as invoices land.
 */

export const DKK_PER_EUR = 7.46;

export type BillStatus = "paid" | "booked" | "invoice pending";

export interface IncomeLine {
  readonly label: string;
  readonly detail: string;
  readonly amountEUR: number;
}

export interface BillLine {
  readonly vendor: string;
  readonly label: string;
  readonly detail: string;
  readonly amountDKK: number;
  readonly status: BillStatus;
  /** The original bill/booking/invoice, dropped in /public/bills. */
  readonly billUrl?: string;
}

export const INCOME: readonly IncomeLine[] = [
  {
    label: "28 early bird tickets",
    detail:
      "€35 each. Booking fees go to the ticket provider, not us.",
    amountEUR: 980,
  },
  {
    label: "2 standard tickets",
    detail:
      "€45 each, sold before the cap at 30 seats.",
    amountEUR: 90,
  },
  {
    label: "8 evening social add-ons",
    detail:
      "€80 each: 7 joining, 1 cancel. Three more guests pay the restaurant directly.",
    amountEUR: 640,
  },
] as const;

export const BILLS: readonly BillLine[] = [
  {
    vendor: "Microsoft venue catering",
    label: "Lunch and all-day coffee, tea & water for 30",
    detail:
      "Lunch 95 kr + all-day coffee, tea and water 110 kr per seat. 6,150 kr ex VAT.",
    amountDKK: 7687.5,
    status: "invoice pending",
  },
  {
    vendor: "Boulebar Nørregade",
    label: "Evening social: pétanque + three-course dinner",
    detail:
      "595 kr per head: pétanque 125 kr + three-course menu 470 kr. 10 are going; this bill covers 7, the other 3 pay the restaurant directly.",
    amountDKK: 4165,
    status: "booked",
    billUrl: "/bills/boulebar-booking.png",
  },
] as const;

/** The big zeros that make the rest possible. */
export const FREE_STUFF: readonly { label: string; detail: string }[] = [
  {
    label: "The venue",
    detail:
      "Microsoft hosts us at Kanalvej for free.",
  },
  {
    label: "The speakers",
    detail:
      "Volunteers, paying their own travel and stay. No fees, no sponsors.",
  },
  {
    label: "The team",
    detail:
      "Community members, evenings and weekends, unpaid.",
  },
  {
    label: "The website",
    detail: "Built by the community, hosted on free tiers.",
  },
] as const;

export const eurFromDKK = (dkk: number): number => dkk / DKK_PER_EUR;
export const dkkFromEUR = (eur: number): number => eur * DKK_PER_EUR;

export function incomeTotalEUR(): number {
  return INCOME.reduce((total, line) => total + line.amountEUR, 0);
}

export function billsTotalEUR(): number {
  return BILLS.reduce((total, line) => total + eurFromDKK(line.amountDKK), 0);
}

export function billsTotalDKK(): number {
  return BILLS.reduce((total, line) => total + line.amountDKK, 0);
}

/** Whatever is left after the bills, back into the day. */
export function leftoverEUR(): number {
  return incomeTotalEUR() - billsTotalEUR();
}

export function formatEUR(eur: number): string {
  return `€${eur.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDKK(dkk: number): string {
  return `${Math.round(dkk).toLocaleString("en-US")} kr`;
}
