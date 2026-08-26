import {
  Coffee,
  Hand,
  Mic,
  Users,
  PartyPopper,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react";
import Image from "next/image";
import { MvpBadge } from "@/components/mvp-badge";
import {
  isMvpSpeaker,
  type AgendaItem,
  type AgendaKind,
  type Speaker,
} from "@/lib/event";
import { getAgenda } from "@/lib/agenda";

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
    : `${to12h(item.time)} onwards`;
}

// Rough rendered height per row, so the two columns split by weight instead of
// a fixed clock time. Talks carry multi-line titles and topic chips, so they
// dominate; compact break rows barely count. This keeps the afternoon column
// from looking empty when the day is lopsided (more morning talks than
// afternoon), and re-balances itself as the Sessionize schedule changes.
function rowWeight(item: AgendaItem): number {
  if (isCompact(item)) return 1;
  if (item.kind === "sessions") return 5;
  return 3;
}

/**
 * Split the ordered agenda into two chronological columns of roughly equal
 * height: walk the rows accumulating weight and cut where the two sides are
 * closest to even. Column one stays earlier-in-the-day than column two.
 */
function balancedSplit(
  items: readonly AgendaItem[],
): [AgendaItem[], AgendaItem[]] {
  const total = items.reduce((sum, item) => sum + rowWeight(item), 0);
  let acc = 0;
  let bestIdx = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < items.length; i++) {
    acc += rowWeight(items[i - 1]);
    const diff = Math.abs(acc - (total - acc));
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }
  return [items.slice(0, bestIdx), items.slice(bestIdx)];
}

/** Slim row for changeovers and short breaks — a dot on the rail + a one-liner. */
function CompactRow({ item }: { item: AgendaItem }) {
  return (
    <li className="reveal flex items-center gap-3 text-xs text-muted-foreground">
      <span className="relative z-10 flex w-9 shrink-0 justify-center">
        <span className="size-2 rounded-full bg-white/25 ring-4 ring-background" />
      </span>
      <span className="shrink-0 tabular-nums">{to12h(item.time)}</span>
      <span className="h-px flex-1 bg-white/5" />
      <span className="shrink-0">{item.title}</span>
    </li>
  );
}

/** The timeline node: a speaker's face for a talk, otherwise the kind's icon. */
function RailNode({ item }: { item: AgendaItem }) {
  const { icon: Icon } = KIND_META[item.kind];
  const portrait = item.speakers?.find((s) => s.photo);

  if (portrait?.photo) {
    // Fixed-height pill: the gradient trails below the photo, but every
    // speaker node is the SAME height (h-24, under the shortest possible
    // card). Letting it stretch to card height made long titles read as
    // longer sessions.
    return (
      <span className="brand-gradient-bg relative z-10 mt-0.5 flex h-24 w-9 shrink-0 justify-center self-start rounded-full p-[2px]">
        <Image
          src={portrait.photo}
          alt=""
          width={32}
          height={32}
          unoptimized
          className="size-8 rounded-full object-cover"
        />
      </span>
    );
  }
  return (
    <span
      className={`relative z-10 mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border ${
        item.featured
          ? "border-transparent brand-gradient-bg text-white"
          : "border-white/10 bg-card text-brand-pink"
      }`}
    >
      <Icon className="size-4" />
    </span>
  );
}

/**
 * The technology areas a session covers: the union of its speakers' areas, in
 * order, deduped so a co-presented talk doesn't repeat a shared area.
 */
function sessionTopics(speakers: readonly Speaker[]): string[] {
  return [...new Set(speakers.flatMap((s) => s.topics ?? []))];
}

/** Technology-area chips, so the room can scan the day by subject. */
function TopicChips({ topics }: { topics: readonly string[] }) {
  return (
    <p className="mt-2 flex flex-wrap gap-1">
      {topics.map((topic) => (
        <span
          key={topic}
          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
        >
          {topic}
        </span>
      ))}
    </p>
  );
}

/** The people presenting, credited under the title with their MVP badge. */
function SpeakerCredits({ speakers }: { speakers: readonly Speaker[] }) {
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-foreground/90">
      {speakers.map((speaker) => (
        <span key={speaker.name} className="inline-flex items-center gap-1">
          {speaker.name}
          {isMvpSpeaker(speaker) && <MvpBadge size={13} />}
        </span>
      ))}
    </p>
  );
}

/** Full card for sessions and key moments — a node on the rail + a card. */
function FullRow({ item }: { item: AgendaItem }) {
  // A real talk outranks the connective tissue around it.
  const isTalk = item.kind === "sessions";
  // Only talks get topic chips: on the round-table they'd list every area in
  // the room, which tells the reader nothing.
  const topics = isTalk ? sessionTopics(item.speakers ?? []) : [];
  return (
    <li className="reveal flex gap-3">
      <RailNode item={item} />
      <div
        className={`min-w-0 flex-1 rounded-xl border p-3 transition-colors ${
          item.featured
            ? "border-brand-pink/30 bg-brand-pink/[0.06]"
            : item.optional
              ? "border-dashed border-white/15 bg-white/[0.02]"
              : isTalk
                ? "border-white/15 bg-white/[0.055] hover:bg-white/[0.08]"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold tabular-nums text-foreground/90">
            {timeRange(item)}
          </span>
          {item.featured ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-brand-pink">
              <Sparkles className="size-3" />
              Signature
            </span>
          ) : (
            item.optional && (
              <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Optional
              </span>
            )
          )}
        </div>
        <h3
          className={`font-semibold leading-tight ${isTalk ? "text-base" : "text-sm"}`}
        >
          {item.title}
        </h3>
        {item.speakers?.length ? (
          <SpeakerCredits speakers={item.speakers} />
        ) : (
          item.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          )
        )}
        {topics.length > 0 && <TopicChips topics={topics} />}
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
      {/* Brand-gradient spine running through the nodes (left gutter). One
          consistent line, so it no longer depends on each avatar stretching. */}
      <ol className="relative space-y-2 before:absolute before:bottom-3 before:left-[17px] before:top-3 before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-brand-pink/70 before:via-brand-purple/70 before:to-brand-teal/70">
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
  // The curated AGENDA is the source of truth; only speaker photos and
  // taglines come from Sessionize.
  const items = await getAgenda();

  // Split the day into two columns of roughly equal height, rather than at a
  // fixed time, so neither column looks empty when the schedule is lopsided.
  const [morning, afternoon] = balancedSplit(items);

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
          Six community sessions through the day, our CloudHour round-table and
          speaker AMA, then networking and drinks to round it off.
        </p>
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2">
        <Column label="Morning" items={morning} />
        <Column label="Afternoon" items={afternoon} />
      </div>
    </section>
  );
}
