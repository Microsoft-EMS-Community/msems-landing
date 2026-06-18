import { EVENT, type Speaker, type AgendaItem, type AgendaKind } from "./event";

/** Raw shape of a speaker from the Sessionize "Speakers" view. */
interface SessionizeLink {
  title?: string;
  url?: string;
  linkType?: string;
}
interface SpeakerSession {
  name?: string;
}
interface SessionizeSpeaker {
  fullName?: string;
  tagLine?: string;
  profilePicture?: string | null;
  sessions?: SpeakerSession[];
  links?: SessionizeLink[];
}

/** Raw shape from the Sessionize "Sessions" view (grouped). */
interface ScheduleSession {
  title?: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isServiceSession?: boolean;
  speakers?: { name?: string }[];
}
interface SessionGroup {
  sessions?: ScheduleSession[];
}

/**
 * Fetch accepted speakers from the Sessionize JSON API and map them to the
 * site's Speaker shape. Cached for 10 minutes (ISR). Returns [] on any error
 * so the Speakers section can fall back gracefully.
 */
export async function getSessionizeSpeakers(): Promise<Speaker[]> {
  const base = EVENT.sessionizeApiBase;
  if (!base) return [];
  try {
    const res = await fetch(`${base}/Speakers`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];

    return (data as SessionizeSpeaker[])
      .filter((s) => typeof s.fullName === "string" && s.fullName.trim())
      .map((s) => {
        const linkedin = s.links?.find(
          (l) => l.linkType === "LinkedIn",
        )?.url;
        const session = (s.sessions ?? [])
          .map((sess) => sess.name)
          .filter(Boolean)
          .join(", ");
        return {
          name: s.fullName!.trim(),
          title: s.tagLine?.trim() || undefined,
          session: session || undefined,
          photo: s.profilePicture || undefined,
          linkedin: linkedin || undefined,
        } satisfies Speaker;
      });
  } catch {
    return [];
  }
}

/**
 * Build the agenda from the Sessionize schedule once it's published. Returns
 * scheduled sessions sorted by start time, mapped to the AgendaItem shape so
 * the existing Agenda layout renders them. Returns [] until a schedule exists,
 * so the hand-curated AGENDA stays the fallback.
 */
export async function getSessionizeAgenda(): Promise<AgendaItem[]> {
  const base = EVENT.sessionizeApiBase;
  if (!base) return [];
  try {
    const res = await fetch(`${base}/Sessions`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const groups: unknown = await res.json();
    if (!Array.isArray(groups)) return [];

    const sessions = (groups as SessionGroup[]).flatMap((g) =>
      Array.isArray(g.sessions) ? g.sessions : [],
    );
    // Keep only scheduled sessions (have a start time) and order by it. The
    // timestamp carries a Z but is wall-clock for the event, so read HH:MM
    // straight from the string rather than converting time zones.
    const scheduled = sessions
      .filter((s): s is ScheduleSession & { startsAt: string; title: string } =>
        typeof s.startsAt === "string" &&
        s.startsAt.length >= 16 &&
        typeof s.title === "string",
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    return scheduled.map((s) => {
      const names = (s.speakers ?? [])
        .map((sp) => sp.name)
        .filter((n): n is string => Boolean(n));
      const kind: AgendaKind = s.isServiceSession ? "break" : "sessions";
      const description = names.length
        ? `with ${names.join(", ")}`
        : (s.description ?? "").slice(0, 160);
      return {
        time: s.startsAt.slice(11, 16),
        endTime:
          typeof s.endsAt === "string" && s.endsAt.length >= 16
            ? s.endsAt.slice(11, 16)
            : undefined,
        title: s.title,
        description,
        kind,
      } satisfies AgendaItem;
    });
  } catch {
    return [];
  }
}
