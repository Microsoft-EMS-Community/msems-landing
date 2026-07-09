import {
  EVENT,
  speakerCountry,
  speakerLinkedIn,
  type Speaker,
  type AgendaItem,
  type AgendaKind,
} from "./event";

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
  id?: string;
  fullName?: string;
  tagLine?: string;
  bio?: string | null;
  profilePicture?: string | null;
  sessions?: SpeakerSession[];
  links?: SessionizeLink[];
}

/** Raw shape of a grid session from the Sessionize "GridSmart" view. */
interface ScheduleSession {
  title?: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isServiceSession?: boolean;
  speakers?: { id?: string; name?: string }[];
}
interface GridRoom {
  sessions?: ScheduleSession[];
}
interface GridDay {
  rooms?: GridRoom[];
}

/**
 * Classify a grid row to the site's agenda kinds by its title, so the right
 * icon/treatment renders. Everything built directly in the Sessionize grid is
 * flagged "service", so the title (not that flag) drives this.
 */
function classify(title: string): {
  kind: AgendaKind;
  featured?: boolean;
  description?: string;
} {
  const t = title.toLowerCase();
  if (/registration|welcome coffee|check.?in|doors/.test(t))
    return { kind: "registration", description: "Badge pickup, coffee and good mornings." };
  if (/cloud ?hour/.test(t))
    return {
      kind: "discussion",
      featured: true,
      description:
        "Our round-the-table discussion from Discord, live and in person. An open-floor AMA with the day's speakers and the community.",
    };
  if (/closing|wrap/.test(t))
    return { kind: "closing", description: "Closing notes and what's next for the community." };
  if (/lunch/.test(t))
    return { kind: "break", description: "Food, drinks and time to put faces to the Discord names." };
  if (/coffee|break|refreshment/.test(t))
    return { kind: "break", description: "Refuel and catch up with the room." };
  if (/network|drinks|social|mingle/.test(t))
    return { kind: "social", description: "Wind down with drinks and good conversation to close the day." };
  if (/introduction|welcome|kickoff|opening/.test(t))
    return { kind: "welcome", description: "A quick hello from the community and how the day will run." };
  if (/changeover|transition|swap/.test(t)) return { kind: "changeover" };
  return { kind: "sessions" };
}

/**
 * Fetch accepted speakers from the Sessionize JSON API and map them to the
 * site's Speaker shape. Cached for 10 minutes (ISR). Returns [] on any error
 * so the Speakers section can fall back gracefully.
 */
/**
 * The raw Speakers view. Shared by the speakers list and the agenda's photo
 * join; both hit the same URL with the same options, so Next serves the second
 * caller from the fetch cache rather than making a second request.
 */
async function fetchSpeakersRaw(): Promise<SessionizeSpeaker[]> {
  const base = EVENT.sessionizeApiBase;
  if (!base) return [];
  try {
    const res = await fetch(`${base}/Speakers`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as SessionizeSpeaker[]) : [];
  } catch {
    return [];
  }
}

export async function getSessionizeSpeakers(): Promise<Speaker[]> {
  try {
    const data = await fetchSpeakersRaw();

    return data
      .filter((s) => typeof s.fullName === "string" && s.fullName.trim())
      .map((s) => {
        const name = s.fullName!.trim();
        const linkedin = s.links?.find(
          (l) => l.linkType === "LinkedIn",
        )?.url;
        const session = (s.sessions ?? [])
          .map((sess) => sess.name)
          .filter(Boolean)
          .join(", ");
        return {
          name,
          title: s.tagLine?.trim() || undefined,
          session: session || undefined,
          bio: s.bio?.trim() || undefined,
          photo: s.profilePicture || undefined,
          linkedin: speakerLinkedIn(name, linkedin),
          country: speakerCountry(name),
        } satisfies Speaker;
      });
  } catch {
    return [];
  }
}

/**
 * Build the full agenda from the Sessionize published grid (GridSmart view).
 * Rows are mapped to the site's AgendaItem shape and ordered by start time, so
 * Sessionize is the single source of truth once a schedule exists. Returns []
 * on any error / empty grid, so the hand-curated AGENDA stays the fallback.
 */
export async function getSessionizeAgenda(): Promise<AgendaItem[]> {
  const base = EVENT.sessionizeApiBase;
  if (!base) return [];
  try {
    const [res, speakerRows] = await Promise.all([
      fetch(`${base}/GridSmart`, { next: { revalidate: 600 } }),
      fetchSpeakersRaw(),
    ]);
    if (!res.ok) return [];
    const days: unknown = await res.json();
    if (!Array.isArray(days)) return [];

    const sessions = (days as GridDay[])
      .flatMap((d) => d.rooms ?? [])
      .flatMap((r) => r.sessions ?? []);

    // Keep only scheduled rows (have a start time) and order by it. The
    // timestamp is wall-clock for the event, so read HH:MM straight from the
    // string rather than converting time zones.
    const scheduled = sessions
      .filter((s): s is ScheduleSession & { startsAt: string; title: string } =>
        typeof s.startsAt === "string" &&
        s.startsAt.length >= 16 &&
        typeof s.title === "string" &&
        s.title.trim().length > 0,
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

    // The grid only names its speakers, so pull photo and tagline across from
    // the Speakers view. Match on id (exact); fall back to name if it is absent.
    const byId = new Map(
      speakerRows.filter((s) => s.id).map((s) => [s.id!, s] as const),
    );
    const byName = new Map(
      speakerRows
        .filter((s) => s.fullName)
        .map((s) => [s.fullName!.trim().toLowerCase(), s] as const),
    );

    return scheduled.map((s) => {
      // Strip redundant "(45 mins)"-style durations from grid titles.
      const title = s.title.replace(/\s*\(\d+\s*min(?:ute)?s?\)/gi, "").trim();
      const speakers: Speaker[] = (s.speakers ?? []).flatMap((sp) => {
        const name = sp.name?.trim();
        if (!name) return [];
        // Degrades to a name-only credit when the join misses.
        const full =
          (sp.id ? byId.get(sp.id) : undefined) ??
          byName.get(name.toLowerCase());
        return [
          {
            name,
            title: full?.tagLine?.trim() || undefined,
            photo: full?.profilePicture || undefined,
          },
        ];
      });
      const meta = classify(title);
      return {
        time: s.startsAt.slice(11, 16),
        endTime:
          typeof s.endsAt === "string" && s.endsAt.length >= 16
            ? s.endsAt.slice(11, 16)
            : undefined,
        title,
        description: meta.description,
        kind: meta.kind,
        ...(speakers.length ? { speakers } : {}),
        ...(meta.featured ? { featured: true } : {}),
      } satisfies AgendaItem;
    });
  } catch {
    return [];
  }
}
