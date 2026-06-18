import { EVENT, SITE_URL } from "./event";

/** The link people include when they share: the public event site. */
export const SHARE_LINK = SITE_URL;

/** The lead hashtag, highlighted in the UI and always first in posts. */
export const PRIMARY_HASHTAG = "#MSEMS";

export const HASHTAGS: readonly string[] = [
  PRIMARY_HASHTAG,
  "#MicrosoftSecurity",
  "#Intune",
  "#EntraID",
  "#MSDefender",
  "#MEM",
];

export interface SharePost {
  readonly id: string;
  readonly platform: string;
  readonly note: string;
  /** Body text without the link; the link is appended in the UI. */
  readonly body: string;
}

export const SHARE_POSTS: readonly SharePost[] = [
  {
    id: "linkedin",
    platform: "LinkedIn",
    note: "Longer and professional. Great for your network.",
    body: `Exciting news: the Microsoft EMS Community Summit is happening! 🎉

Join us on ${EVENT.dateLabel} at ${EVENT.venue}, ${EVENT.venueArea}, for a full day of community-led sessions on Intune, Entra ID and Microsoft Defender XDR, our CloudHour round-table and speaker AMA, and an evening social.

It's not-for-profit, community-run, and open to everyone. Seats are limited, so save the date and get notified when registration opens.`,
  },
  {
    id: "x",
    platform: "X / Twitter",
    note: "Short and punchy. Fits in one post.",
    body: `The Microsoft EMS Community Summit is here! 🚀

📅 ${EVENT.dateLabel}
📍 ${EVENT.venue}, ${EVENT.venueArea}

A full day of sessions, our CloudHour round-table & speaker AMA, and an evening social. Open to everyone. Save the date 👇`,
  },
  {
    id: "general",
    platform: "Teams / Discord / email",
    note: "Casual heads-up to drop in a chat or thread.",
    body: `Heads up 👋 The Microsoft EMS Community is hosting a Summit on ${EVENT.dateLabel} at ${EVENT.venue}, ${EVENT.venueArea}. A full day of sessions, our CloudHour round-table & speaker AMA, and an evening social. Not-for-profit and open to everyone, seats are limited. Save the date:`,
  },
] as const;

/** Builds the full post text including link and hashtags. */
export function buildPostText(post: SharePost): string {
  const tags = post.id === "general" ? "" : `\n\n${HASHTAGS.join(" ")}`;
  return `${post.body}\n\n${SHARE_LINK}${tags}`;
}
