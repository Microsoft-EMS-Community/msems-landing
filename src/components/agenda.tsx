import { Coffee, Hand, Mic, Users, PartyPopper, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AGENDA, AGENDA_NOTE, type AgendaKind } from "@/lib/event";

const KIND_META: Record<
  AgendaKind,
  { label: string; icon: typeof Coffee }
> = {
  registration: { label: "Arrival", icon: Coffee },
  welcome: { label: "Stage", icon: Hand },
  sessions: { label: "Sessions", icon: Mic },
  break: { label: "Break", icon: Coffee },
  discussion: { label: "Round-table", icon: Users },
  social: { label: "Social", icon: PartyPopper },
};

export function Agenda() {
  return (
    <section
      id="agenda"
      className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-20 sm:px-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The day, <span className="brand-gradient-text">hour by hour</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Talks and deep dives through the day, our Cloud Hour round-table in
          the afternoon, and a social evening to round it off.
        </p>
      </div>

      <ol className="relative mt-12 space-y-4 before:absolute before:left-[1.4rem] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
        {AGENDA.map((item) => {
          const { label, icon: Icon } = KIND_META[item.kind];
          return (
            <li key={`${item.time}-${item.title}`} className="relative flex gap-4">
              <span
                className={`relative z-10 grid size-12 shrink-0 place-items-center rounded-2xl border ${
                  item.featured
                    ? "border-transparent brand-gradient-bg text-white"
                    : "border-white/10 bg-card text-brand-pink"
                }`}
              >
                <Icon className="size-5" />
              </span>

              <div
                className={`flex-1 rounded-2xl border p-4 transition-colors ${
                  item.featured
                    ? "border-brand-pink/30 bg-brand-pink/[0.06]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    {item.time}
                  </span>
                  <Badge
                    variant="secondary"
                    className="border border-white/10 bg-white/5 text-xs font-normal"
                  >
                    {label}
                  </Badge>
                  {item.featured && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-pink">
                      <Sparkles className="size-3" />
                      Community signature
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {AGENDA_NOTE}
      </p>
    </section>
  );
}
