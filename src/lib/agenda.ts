import { AGENDA, speakerTopics, type AgendaItem, type Speaker } from "./event";
import { getSessionizeSpeakers } from "./sessionize";

/**
 * The curated schedule with speaker photos and taglines joined in from
 * Sessionize by name. If that fetch fails the agenda still renders, with
 * name-only credits, so the schedule never depends on a live API.
 */
export async function getAgenda(): Promise<AgendaItem[]> {
  const profiles = await getSessionizeSpeakers();
  const byName = new Map(profiles.map((s) => [s.name.toLowerCase(), s]));

  const enrich = (speaker: Speaker): Speaker => {
    const full = byName.get(speaker.name.toLowerCase());
    return {
      ...speaker,
      title: speaker.title ?? full?.title,
      photo: speaker.photo ?? full?.photo,
      topics: speaker.topics ?? full?.topics ?? speakerTopics(speaker.name),
    };
  };

  return AGENDA.map((item) =>
    item.speakers ? { ...item, speakers: item.speakers.map(enrich) } : item,
  );
}
