import { EVENT, type Speaker } from "./event";

/** Raw shape of a speaker from the Sessionize "Speakers" view. */
interface SessionizeLink {
  title?: string;
  url?: string;
  linkType?: string;
}
interface SessionizeSession {
  name?: string;
}
interface SessionizeSpeaker {
  fullName?: string;
  tagLine?: string;
  profilePicture?: string | null;
  sessions?: SessionizeSession[];
  links?: SessionizeLink[];
}

/**
 * Fetch accepted speakers from the Sessionize JSON API and map them to the
 * site's Speaker shape. Cached for 10 minutes (ISR). Returns [] on any error
 * so the Speakers section can fall back gracefully.
 */
export async function getSessionizeSpeakers(): Promise<Speaker[]> {
  const url = EVENT.sessionizeSpeakersApi;
  if (!url) return [];
  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
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
