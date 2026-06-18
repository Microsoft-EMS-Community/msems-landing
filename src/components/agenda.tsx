import {
  Coffee,
  Hand,
  Mic,
  Users,
  PartyPopper,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react";
import { AGENDA, type AgendaItem, type AgendaKind } from "@/lib/event";
import { getSessionizeAgenda } from "@/lib/sessionize";

/** "08:30" -> "8:30 AM", "17:00" -> "5 PM" (drops :00 on whole hours). */
function to12h(time: string): string {
  const [h, m = "00"] = time.split(":");
  let hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return time;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return m === "00" ? `${hour} ${ampm}` : `${hour}:${m} ${ampm}`;
}

const KIND_META: Record<AgendaKind, { label: string; icon: typeof Coffee }> = {
  registration: { label: "Arrival", icon: Coffee },
  welcome: { label: "Welcome", icon: Hand },
  sessions: { label: "Session", icon: Mic },
  changeover: { label: "Changeover", icon: ArrowLeftRight },
  break: { label: "Break", icon: Coffee },
  discussion: { label: "Round-table", icon: Users },
  social: { label: "Social", icon: PartyPopper },
  closing: { label: "Closing", icon: Hand },
};

function durationMin(item: AgendaItem): number | null {
  if (!item.endTime) return null;
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  return toMin(item.endTime) - toMin(item.time);
}

// Slim one-line rows for the connective tissue: changeovers and short coffee
// breaks. Lunch (a full hour) stays a proper card.
function isCompact(item: AgendaItem): boolean {
  if (item.kind === "changeover") return true;
  if (item.kind === "break") {
    const dur = durationMin(item);
    return dur !== null && dur <= 30;
  }
  return false;
}

function timeRange(item: AgendaItem): string {
  return item.endTime
    ? `${to12h(item.time)} - ${to12h(item.endTime)}`
    : to12h(item.time);
}

function CompactRow({ item }: { item: AgendaItem }) {
  const { icon: Icon } = KIND_META[item.kind];
  return (
    <li className="reveal flex items-center gap-2.5 py-1 pl-2 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0 text-muted-foreground/70" />
      <span className="shrink-0 tabular-nums">{to12h(item.time)}</span>
      <span className="h-px flex-1 bg-white/5" />
      <span className="shrink-0">{item.title}</span>
    </li>
  );
}

function FullRow({ item }: { item: AgendaItem }) {
  const { icon: Icon } = KIND_META[item.kind];
  return (
    <li
      className={`reveal flex gap-3 rounded-xl border p-3 transition-colors ${
        item.featured
          ? "border-brand-pink/30 bg-brand-pink/[0.06]"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
      }`}
    >
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-xl border ${
          item.featured
            ? "border-transparent brand-gradient-bg text-white"
            : "border-white/10 bg-card text-brand-pink"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tabular-nums text-foreground/90">
            {timeRange(item)}
          </span>
          {item.featured && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-brand-pink">
              <Sparkles className="size-3" />
              Signature
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold leading-tight">{item.title}</h3>
        {item.description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </li>
  );
}

function Column({ label, items }: { label: string; items: AgendaItem[] }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-pink/80">
        {label}
      </h3>
      <ol className="space-y-2">
        {items.map((item) =>
          isCompact(item) ? (
            <CompactRow key={`${item.time}-${item.title}`} item={item} />
          ) : (
            <FullRow key={`${item.time}-${item.title}`} item={item} />
          ),
        )}
      </ol>
    </div>
  );
}

export async function Agenda() {
  // Merge: keep the curated fixed anchors (registration, breaks, Cloud Hour,
  // etc.) and slot the live Sessionize talks between them by time. Until a
  // schedule is published there are no live talks, so the curated AGENDA shows.
  const liveTalks = (await getSessionizeAgenda()).filter(
    (i) => i.kind === "sessions",
  );
  const anchors = AGENDA.filter((a) => a.kind !== "sessions");
  const items: readonly AgendaItem[] =
    liveTalks.length > 0
      ? [...anchors, ...liveTalks].sort((a, b) => a.time.localeCompare(b.time))
      : AGENDA;

  // Split the day into two balanced columns: morning closes with lunch.
  const morning = items.filter((i) => i.time <= "12:25");
  const afternoon = items.filter((i) => i.time > "12:25");

  const note =
    liveTalks.length > 0
      ? "Talks confirmed via Sessionize. Times shown in local time and may change."
      : null;

  return (
    <section
      id="agenda"
      className="mx-auto max-w-4xl scroll-mt-20 px-4 pb-20 sm:px-6"
    >
      <div className="text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          The day, <span className="brand-gradient-text">hour by hour</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          A Copilot kickoff, six community sessions through the day, our Cloud
          Hour round-table and speaker AMA, then networking and drinks to round
          it off.
        </p>
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2">
        <Column label="Morning" items={morning} />
        <Column label="Afternoon" items={afternoon} />
      </div>

      {note && (
        <p className="mt-8 text-center text-xs text-muted-foreground">{note}</p>
      )}
    </section>
  );
}
