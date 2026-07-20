/**
 * Session titles on the generated cards used to be cut off at 90 characters,
 * which silently dropped the tail of longer Sessionize titles. Instead of
 * truncating, step the type size down as the title grows so the whole thing
 * stays on the card. `TOPIC_MAX_CHARS` is only a safety net against absurd
 * input, not a limit real titles are expected to hit.
 */
export const TOPIC_MAX_CHARS = 140;

/**
 * [title length at or below this, points to subtract from the base size]
 * Kept shallow on purpose: the card is 1080px wide with room for a third line,
 * so a long title should wrap rather than shrink to the point of illegibility.
 */
const TOPIC_STEPS: readonly (readonly [number, number])[] = [
  [70, 0],
  [100, 2],
  [130, 4],
];

/** Applied past the last step, so the longest titles still fit. */
const TOPIC_MAX_SHRINK = 6;

/** The font size to render `topic` at, shrinking from `base` as it gets longer. */
export function topicFontSize(topic: string, base: number): number {
  const step = TOPIC_STEPS.find(([maxLength]) => topic.length <= maxLength);
  return base - (step ? step[1] : TOPIC_MAX_SHRINK);
}

/**
 * Same idea for speaker names, which are set much larger than the topic and so
 * run out of width far sooner. Steps are steeper than TOPIC_STEPS because a
 * name wrapping to two lines reads worse than one that is a few points smaller.
 */
const NAME_STEPS: readonly (readonly [number, number])[] = [
  [18, 0],
  [26, 12],
  [34, 20],
];

/** Applied past the last step, up to the 40-char cap the route enforces. */
const NAME_MAX_SHRINK = 26;

/** The font size to render `name` at, shrinking from `base` as it gets longer. */
export function nameFontSize(name: string, base: number): number {
  const step = NAME_STEPS.find(([maxLength]) => name.length <= maxLength);
  return base - (step ? step[1] : NAME_MAX_SHRINK);
}
