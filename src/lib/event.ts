/**
 * Single source of truth for the MS EMS Community in-person event
 * and the community itself. Update these values as details get confirmed.
 */

/** Canonical site URL (www is the primary domain on Vercel). */
export const SITE_URL = "https://www.msems.community";

export const EVENT = {
  name: "Microsoft EMS Community Summit",
  shortName: "EMS Community Summit",
  // Friday, September 4th 2026, 08:30 to 17:00 (Central European Summer Time, UTC+2)
  startsAtISO: "2026-09-04T08:30:00+02:00",
  endsAtISO: "2026-09-04T17:00:00+02:00",
  dateLabel: "Friday, September 4th, 2026",
  timeLabel: "08:30 to 17:00",
  venue: "Microsoft Denmark",
  venueArea: "near Copenhagen",
  feeLabel: "From €30",
  feeNote:
    "The small fee covers lunch, drinks and beverages for the day, plus an optional evening get-together.",
  discordInvite: "https://aka.ms/M365EMSDiscord",
  registrationUrl: "https://aka.ms/M365EMSDiscord",
  contactEmail: "hello@msems.community",
  status: "Save the date",
  // Call for Speakers (Sessionize). Set cfsOpen to false once submissions close.
  cfsUrl: "https://sessionize.com/microsoft-ems-community-summit/",
  cfsOpen: true,
} as const;

/**
 * Where the "Get notified" / sign-up CTAs should send people.
 * Both the hero (top) and final CTA (bottom) read from here, so switching
 * providers later is a one-line change. Pick ONE when an account exists:
 *
 *  1. externalUrl     -> a hosted page (EventX registration, Mailchimp hosted
 *                        form, Microsoft Forms/List). Both CTAs link out to it.
 *  2. mailchimpAction -> a Mailchimp embedded-form action URL. The inline form
 *                        posts straight to Mailchimp (opens their confirmation).
 *  3. both null       -> the built-in inline form posts to /api/notify (interim
 *                        stub; logs only, stores nothing yet).
 *
 * When registration on EventX is live, set externalUrl to the EventX event URL.
 */
export const SIGNUP = {
  externalUrl: null as string | null,
  mailchimpAction: null as string | null,
  // The on-page anchor used when there is no external URL (scrolls to the form).
  anchor: "#notify",
} as const;

export const COMMUNITY = {
  name: "Microsoft EMS Community",
  // Fallback values, overridden by live Discord stats when available.
  members: "2,775+",
  founded: "August 2022",
  tagline:
    "A professional community for enthusiasts and administrators of the Microsoft Enterprise Mobility + Security stack.",
} as const;

export interface HighlightItem {
  readonly title: string;
  readonly description: string;
}

export const HIGHLIGHTS: readonly HighlightItem[] = [
  {
    title: "A full day of sessions",
    description:
      "Community-led talks and deep dives across Intune, Entra ID, Microsoft Defender XDR and the wider EMS stack.",
  },
  {
    title: "Open to everyone",
    description:
      "You don't need to be on the Discord to join. Anyone working with or curious about the Microsoft EMS stack is welcome.",
  },
  {
    title: "Independent, no agenda",
    description:
      "Not-for-profit, community-run and sponsor-free, so the sessions are honest, real-world takes on the Microsoft stack: what works and what doesn't.",
  },
  {
    title: "Optional evening",
    description:
      "Keep the conversation going after the sessions with an optional, relaxed evening get-together.",
  },
] as const;

export interface TopicItem {
  readonly label: string;
}

export const TOPICS: readonly TopicItem[] = [
  { label: "Microsoft Intune & MDM" },
  { label: "Entra ID / Identity" },
  { label: "Microsoft Defender XDR" },
  { label: "Endpoint Security" },
  { label: "Cloud & DevOps" },
  { label: "Certifications & Learning" },
] as const;

export type AgendaKind =
  | "registration"
  | "welcome"
  | "sessions"
  | "break"
  | "discussion"
  | "social"
  | "closing";

export interface AgendaItem {
  readonly time: string;
  /** End time, shown as a range for multi-session blocks. */
  readonly endTime?: string;
  readonly title: string;
  readonly description: string;
  readonly kind: AgendaKind;
  /** Number of talks in this block (renders a "N sessions" badge). */
  readonly sessions?: number;
  /** Highlights a signature moment of the day. */
  readonly featured?: boolean;
}

export const AGENDA_NOTE =
  "Provisional running order. Times and sessions will be confirmed as the program and Call for Speakers are finalised.";

export const AGENDA: readonly AgendaItem[] = [
  {
    time: "08:30",
    title: "Doors open & coffee",
    description: "Badge pickup, coffee and good mornings.",
    kind: "registration",
  },
  {
    time: "09:00",
    title: "Welcome & kickoff",
    description: "A quick hello from the community and how the day will run.",
    kind: "welcome",
  },
  {
    time: "09:15",
    endTime: "12:30",
    title: "Morning sessions",
    description:
      "Community-led talks across Intune, Entra ID and Microsoft Defender XDR, around 45 minutes each, with a coffee break in between.",
    kind: "sessions",
    sessions: 4,
  },
  {
    time: "12:30",
    title: "Lunch & networking",
    description: "Food, drinks and time to put faces to the Discord names.",
    kind: "break",
  },
  {
    time: "13:30",
    endTime: "15:45",
    title: "Afternoon sessions",
    description:
      "More community talks, around 45 minutes each, with hands-on, real-world stories.",
    kind: "sessions",
    sessions: 3,
  },
  {
    time: "15:45",
    endTime: "16:45",
    title: "CloudHour, live",
    description:
      "Our round-the-table discussion from Discord, in person for the first time. An open-floor AMA with the day's speakers and the community. Bring your hardest questions.",
    kind: "discussion",
    featured: true,
  },
  {
    time: "16:45",
    title: "Wrap-up & thanks",
    description: "Closing notes and what's next for the community. The program wraps by 17:00.",
    kind: "closing",
  },
  {
    time: "18:00",
    title: "Evening social",
    description:
      "Wind down with the community over food and drinks. Optional, and usually the best part of the day.",
    kind: "social",
  },
] as const;

export interface PricingTier {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly seatsLabel: string;
  readonly badge?: string;
  readonly featured?: boolean;
  readonly features: readonly string[];
}

/**
 * Ticket pricing. NOTE: prices are not final yet. Keep `pricesFinal: false`
 * until confirmed; the UI shows an "indicative pricing" note while it's false.
 */
export const PRICING = {
  currency: "€",
  pricesFinal: false,
  note: "Indicative pricing, not final yet. Exact prices are confirmed when registration opens.",
  totalSeats: 64,
  socialAddon: {
    label: "Evening social",
    price: 80,
    description: "Optional dinner and drinks with the community after the sessions.",
  },
  tiers: [
    {
      id: "early-bird",
      name: "Early bird",
      price: 30,
      seatsLabel: "First 25 seats",
      badge: "Only 25 available",
      featured: true,
      features: [
        "Full day of sessions",
        "CloudHour round-table & speaker AMA",
        "Lunch, drinks & beverages",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      price: 40,
      seatsLabel: "Seats 26 to 64",
      features: [
        "Full day of sessions",
        "CloudHour round-table & speaker AMA",
        "Lunch, drinks & beverages",
      ],
    },
  ] satisfies readonly PricingTier[],
} as const;

export type TeamRole = "moderator" | "contributor";

export interface TeamMember {
  readonly name: string;
  readonly handle: string;
  readonly role: TeamRole;
  /** Microsoft MVP awardee (renders the MVP badge). */
  readonly mvp?: boolean;
  /** Part of the summit organising team (gets an "Event team" badge). */
  readonly eventTeam?: boolean;
  /** Full LinkedIn profile URL; renders a LinkedIn link when set. */
  readonly linkedin?: string;
  /** Photo path in /public; falls back to initials avatar when unset. */
  readonly photo?: string;
}

export const TEAM: readonly TeamMember[] = [
  // Moderators
  {
    name: "Philip Marsh",
    handle: "katos.",
    role: "moderator",
    photo: "/team/philip-marsh.jpg",
    linkedin: "https://www.linkedin.com/in/marshsecurity/",
  },
  {
    name: "Joël Prins",
    handle: "joelprins",
    role: "moderator",
    photo: "/team/joel-prins.jpg",
    eventTeam: true,
    linkedin: "https://www.linkedin.com/in/jo%C3%ABl-prins-4b4655aa/",
  },
  {
    name: "Jonas Bøgvad",
    handle: "jonasb",
    role: "moderator",
    photo: "/team/jonas-bogvad.jpg",
    mvp: true,
    eventTeam: true,
    linkedin: "https://www.linkedin.com/in/jonasbogvad/",
  },
  {
    name: "Jay Kerai",
    handle: "darkmodeordie",
    role: "moderator",
    photo: "/team/jay-kerai.jpg",
    mvp: true,
    eventTeam: true,
    linkedin: "https://www.linkedin.com/in/jay-kerai-cyber/",
  },
  // Contributors
  {
    name: "Effie Antoniadi",
    handle: "badfish64",
    role: "contributor",
    photo: "/team/effie-antoniadi.png",
    eventTeam: true,
    linkedin: "https://www.linkedin.com/in/eantoniadi/",
  },
  {
    name: "Sebastian Flæng Markdanner",
    handle: "taintia",
    role: "contributor",
    photo: "/team/sebastian.jpg",
    mvp: true,
    eventTeam: true,
    linkedin: "https://www.linkedin.com/in/sebastian-markdanner/",
  },
  {
    name: "Nicklas Olsen",
    handle: "nicklas_olsen",
    role: "contributor",
    photo: "/team/nicklas-olsen.jpg",
    mvp: true,
    linkedin: "https://www.linkedin.com/in/nicklas-o-40337b205/",
  },
  {
    name: "Sven Visser",
    handle: "falc0n123",
    role: "contributor",
    photo: "/team/sven-visser.jpg",
    linkedin: "https://www.linkedin.com/in/sven-visser-36904649/",
  },
  { name: "ToastedTy", handle: "toastedty", role: "contributor" },
] as const;

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export const FAQS: readonly FaqItem[] = [
  {
    question: "Who is this event for?",
    answer:
      "Everyone. You don't need to be a member of the Discord community to attend. If you work with or are curious about the Microsoft Enterprise Mobility + Security stack, you're welcome to join.",
  },
  {
    question: "Is this an official Microsoft event?",
    answer:
      "No. The Microsoft EMS Community is an independent, community-run group and is not directly affiliated with Microsoft. The event is kindly hosted at Microsoft Denmark and powered by Microsoft, but it is organised by the community, for the community.",
  },
  {
    question: "How much does it cost?",
    answer:
      "It's a not-for-profit event, priced to cover costs only. Early-bird tickets start at €30 and standard tickets are €40, both including the full day, sessions, lunch and drinks. An optional evening social can be added on. Prices are indicative and confirmed when registration opens. See the Tickets section for the full breakdown.",
  },
  {
    question: "Where exactly is it?",
    answer:
      "At Microsoft Denmark, near Copenhagen. The location is confirmed; the full address and travel details will be shared with registered attendees closer to the date.",
  },
  {
    question: "What about the agenda and speakers?",
    answer:
      "The program is being finalised and the Call for Speakers is now open on Sessionize, so if you'd like to present, submit your session via the Call for Speakers section. The full agenda will be published here once it's locked in.",
  },
  {
    question: "How do I get a seat?",
    answer:
      "Seats are limited. Sign up to get notified below, or join the Discord, and you'll be first to hear when registration opens.",
  },
] as const;
