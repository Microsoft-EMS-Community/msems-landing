import type { Metadata } from "next";
import {
  ArrowDown,
  Building2,
  HandHeart,
  PiggyBank,
  Receipt,
  Wallet,
} from "lucide-react";
import { BillLightbox } from "@/components/bill-lightbox";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  BILLS,
  FREE_STUFF,
  INCOME,
  billsTotalDKK,
  billsTotalEUR,
  dkkFromEUR,
  eurFromDKK,
  formatDKK,
  formatEUR,
  incomeTotalEUR,
  leftoverEUR,
  type BillStatus,
} from "@/lib/budget";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: "Open books | Microsoft EMS Community Summit",
  description:
    "Every krone in and out of the Summit: tickets in, bills out, and whatever is left goes back into the day. Not-for-profit, with the receipts to prove it.",
};

const STATUS_STYLE: Record<BillStatus, string> = {
  paid: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  booked: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  "invoice pending": "border-amber-400/40 bg-amber-400/10 text-amber-300",
};

function StatusChip({ status }: { readonly status: BillStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLE[status]}`}
    >
      {status}
    </span>
  );
}

function FlowCard({
  icon: Icon,
  label,
  amount,
  sub,
  tone,
}: {
  readonly icon: typeof Wallet;
  readonly label: string;
  readonly amount: string;
  readonly sub: string;
  readonly tone: string;
}) {
  return (
    <div className={`flex-1 rounded-2xl border p-5 text-center ${tone}`}>
      <Icon className="mx-auto size-5" />
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{amount}</p>
      <p className="mt-0.5 text-xs tabular-nums opacity-70">{sub}</p>
    </div>
  );
}

export default function BudgetPage() {
  const incomeEUR = incomeTotalEUR();
  const billsEUR = billsTotalEUR();
  const potEUR = leftoverEUR();

  return (
    <main className="flex-1">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-4 pb-20 pt-16 sm:px-6">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-teal">
              <HandHeart className="size-3.5" />
              Not for profit · run at cost
            </span>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Open <span className="brand-gradient-text">books</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Every krone in and out of the Summit. Whatever is left goes back into the day.
          </p>
        </div>

        {/* The downstream */}
        <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <FlowCard
            icon={Wallet}
            label="Money in"
            amount={formatEUR(incomeEUR)}
            sub={formatDKK(dkkFromEUR(incomeEUR))}
            tone="border-white/10 bg-white/[0.03]"
          />
          <ArrowDown className="mx-auto size-5 shrink-0 text-muted-foreground sm:rotate-[270deg]" />
          <FlowCard
            icon={Receipt}
            label="Bills"
            amount={formatEUR(billsEUR)}
            sub={formatDKK(billsTotalDKK())}
            tone="border-white/10 bg-white/[0.03]"
          />
          <ArrowDown className="mx-auto size-5 shrink-0 text-muted-foreground sm:rotate-[270deg]" />
          <FlowCard
            icon={PiggyBank}
            label="Left over"
            amount={formatEUR(potEUR)}
            sub={formatDKK(dkkFromEUR(potEUR))}
            tone="border-brand-pink/40 bg-brand-pink/[0.06] text-brand-pink"
          />
        </div>

        {/* Money in */}
        <section className="mt-14">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
            <Wallet className="size-5 text-brand-teal" />
            Money in
          </h2>
          <ul className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {INCOME.map((line) => (
              <li
                key={line.label}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{line.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {line.detail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatEUR(line.amountEUR)}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {formatDKK(dkkFromEUR(line.amountEUR))}
                  </p>
                </div>
              </li>
            ))}
            <li className="flex flex-wrap items-baseline justify-between gap-4 p-4">
              <span className="flex flex-wrap items-center gap-x-4">
                <BillLightbox
                  src="/bills/weeztix-sales.png"
                  label="See the ticket sales report"
                />
                <BillLightbox
                  src="/bills/weeztix-receipt-sample.png"
                  label="A sample receipt"
                />
              </span>
              <p className="ml-auto font-semibold">Total in</p>
              <p className="text-lg font-bold tabular-nums">
                {formatEUR(incomeEUR)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · {formatDKK(dkkFromEUR(incomeEUR))}
                </span>
              </p>
            </li>
          </ul>
        </section>

        {/* Bills */}
        <section className="mt-10">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
            <Receipt className="size-5 text-brand-purple" />
            The bills
          </h2>
          <ul className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {BILLS.map((line) => (
              <li
                key={line.vendor}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {line.vendor}
                    <StatusChip status={line.status} />
                  </p>
                  <p className="mt-0.5 text-sm">{line.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {line.detail}
                  </p>
                  {line.billUrl && (
                    <BillLightbox
                      src={line.billUrl}
                      label="See the original bill"
                    />
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatEUR(eurFromDKK(line.amountDKK))}
                  </p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {formatDKK(line.amountDKK)}
                  </p>
                </div>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 p-4">
              <p className="font-semibold">Total out</p>
              <p className="text-lg font-bold tabular-nums">
                {formatEUR(billsEUR)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  · {formatDKK(billsTotalDKK())}
                </span>
              </p>
            </li>
          </ul>
        </section>

        {/* The snack pot */}
        <section className="mt-10 rounded-2xl border border-brand-pink/30 bg-brand-pink/[0.05] p-6">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
            <PiggyBank className="size-5 text-brand-pink" />
            What&apos;s left: {formatEUR(potEUR)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({formatDKK(dkkFromEUR(potEUR))})
            </span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Goes back into the event. Usage to be decided.
          </p>
        </section>

        {/* What costs nothing */}
        <section className="mt-10">
          <h2 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
            <Building2 className="size-5 text-brand-teal" />
            What costs nothing
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {FREE_STUFF.map((item) => (
              <li
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="font-medium">{item.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-center text-xs leading-relaxed text-muted-foreground">
          All figures incl. 25% VAT; kroner at the peg (€1 = 7.46 kr), so a krone of rounding can appear. Updated as invoices land. Ticketing and VAT: sky made simple ApS, see the{" "}
          <a
            href="/policies"
            className="underline underline-offset-2 hover:text-foreground"
          >
            policies page
          </a>
          . Questions: {EVENT.contactEmail}
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
