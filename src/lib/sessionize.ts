import {
  EVENT,
  speakerCountry,
  speakerLinkedIn,
  speakerTopics,
  type Speaker,
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
          topics: speakerTopics(name),
        } satisfies Speaker;
      });
  } catch {
    return [];
  }
}
