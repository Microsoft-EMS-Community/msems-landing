/**
 * Single source of truth for the MS EMS Community in-person event
 * and the community itself. Update these values as details get confirmed.
 */

/** Canonical site URL (www is the primary domain on Vercel). */
export const SITE_URL = "https://www.msems.community";

export const EVENT = {
  name: "Microsoft EMS Community Summit",
  shortName: "EMS Community Summit",
  // Friday, September 4th 2026, 8:30 AM to 5:00 PM (Central European Summer Time, UTC+2)
  startsAtISO: "2026-09-04T08:30:00+02:00",
  endsAtISO: "2026-09-04T17:00:00+02:00",
  dateLabel: "Friday, September 4th, 2026",
  year: 2026,
  timeLabel: "8:30 AM to 5:00 PM",
  venue: "Microsoft",
  venueArea: "near Copenhagen",
  venueAddress: "Kanalvej 7, 2800 Kongens Lyngby",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Microsoft%20Kanalvej%207%202800%20Kongens%20Lyngby",
  feeLabel: "From €30",
  feeNote:
    "The small fee covers lunch, drinks and beverages for the day. An optional evening social can be added on.",
  discordInvite: "https://aka.ms/M365EMSDiscord",
  registrationUrl: "https://aka.ms/M365EMSDiscord",
  githubUrl: "https://github.com/Microsoft-EMS-Community",
  contactEmail: "hello@msems.community",
  status: "Save the date",
  // Call for Speakers (Sessionize). Set cfsOpen to false once submissions close.
  cfsUrl: "https://sessionize.com/microsoft-ems-community-summit/",
  cfsOpen: true,
  // Sessionize JSON API (read-only, public). Powers Speakers + Agenda.
  // Views appended: /Speakers, /Sessions.
  sessionizeApiBase: "https://sessionize.com/api/v2/3zmvdvh1/view",
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
    "A professional community for admins and enthusiasts of the Microsoft Enterprise Mobility + Security stack, from Intune and Entra ID to Microsoft Defender XDR.",
} as const;

export interface HighlightItem {
  readonly title: string;
  readonly description: string;
}

export const HIGHLIGHTS: readonly HighlightItem[] = [
  {
    title: "A full day of sessions",
    description:
      "Community-led talks and deep dives across Intune, Entra ID and Microsoft Defender XDR, with real-world takeaways you can put to use the next morning.",
  },
  {
    title: "Open to everyone",
    description:
      "You don't need to be on the Discord to join. Anyone working with or curious about the Microsoft EMS stack is welcome.",
  },
  {
    title: "Independent & vendor-neutral",
    description:
      "Not-for-profit, community-run and sponsor-free. No booths, no badge scans, no 'quick word from our partners', just honest, real-world takes on what works and what doesn't.",
  },
  {
    title: "Optional evening",
    description:
      "Keep the conversation going with an optional evening of pétanque, food and drinks.",
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
  | "changeover"
  | "break"
  | "discussion"
  | "social"
  | "closing";

export interface AgendaItem {
  readonly time: string;
  /** End time, shown as a range for multi-session blocks. */
  readonly endTime?: string;
  readonly title: string;
  /** Optional blurb; session placeholders stay title-only until confirmed. */
  readonly description?: string;
  readonly kind: AgendaKind;
  /** Number of talks in this block (renders a "N sessions" badge). */
  readonly sessions?: number;
  /** Highlights a signature moment of the day. */
  readonly featured?: boolean;
  /** Marks an add-on outside the core day (renders an "Optional" tag). */
  readonly optional?: boolean;
}

export const AGENDA_NOTE =
  "Provisional running order. Times and sessions will be confirmed as the program and Call for Speakers are finalized.";

export const AGENDA: readonly AgendaItem[] = [
  {
    time: "08:30",
    endTime: "09:00",
    title: "Registration & welcome coffee",
    description: "Badge pickup, coffee and good mornings.",
    kind: "registration",
  },
  {
    time: "09:00",
    endTime: "09:25",
    title: "Welcome & kickoff",
    description: "A quick hello from the community and how the day will run.",
    kind: "welcome",
  },
  {
    time: "09:25",
    endTime: "10:15",
    title: "Session 1",
    kind: "sessions",
  },
  {
    time: "10:15",
    endTime: "10:20",
    title: "Changeover",
    description: "Quick room swap between sessions.",
    kind: "changeover",
  },
  {
    time: "10:20",
    endTime: "11:10",
    title: "Session 2",
    kind: "sessions",
  },
  {
    time: "11:10",
    endTime: "11:35",
    title: "Coffee break",
    description: "Refuel and catch up with the room.",
    kind: "break",
  },
  {
    time: "11:35",
    endTime: "12:25",
    title: "Session 3",
    kind: "sessions",
  },
  {
    time: "12:25",
    endTime: "13:25",
    title: "Lunch & networking",
    description: "Food, drinks and time to put faces to the Discord names.",
    kind: "break",
  },
  {
    time: "13:25",
    endTime: "14:15",
    title: "Session 4",
    kind: "sessions",
  },
  {
    time: "14:15",
    endTime: "14:20",
    title: "Changeover",
    description: "Quick room swap between sessions.",
    kind: "changeover",
  },
  {
    time: "14:20",
    endTime: "15:10",
    title: "Session 5",
    kind: "sessions",
  },
  {
    time: "15:10",
    endTime: "15:40",
    title: "Coffee break & networking",
    description: "Coffee and connections before the final stretch.",
    kind: "break",
  },
  {
    time: "15:40",
    endTime: "16:25",
    title: "CloudHour (Session 6)",
    description:
      "Our round-the-table discussion from Discord, live and in person. An open-floor AMA with the day's speakers and the community. Bring your hardest questions.",
    kind: "discussion",
    featured: true,
  },
  {
    time: "16:25",
    endTime: "16:35",
    title: "Closing remarks",
    description: "Closing notes and what's next for the community.",
    kind: "closing",
  },
  {
    time: "16:35",
    endTime: "17:00",
    title: "Networking",
    description: "Wind down with drinks and good conversation to close the day.",
    kind: "social",
  },
  {
    time: "18:00",
    title: "Evening social",
    description:
      "Keep the day going with pétanque, food and drinks in the heart of Copenhagen. Plans being finalized.",
    kind: "social",
    optional: true,
  },
] as const;

export interface Speaker {
  readonly name: string;
  /** Role and/or company, e.g. "Microsoft MVP". */
  readonly title?: string;
  /** Session title. */
  readonly session?: string;
  /** Short speaker bio. */
  readonly bio?: string;
  /** Photo path in /public, e.g. /speakers/jane-doe.jpg. */
  readonly photo?: string;
  readonly linkedin?: string;
}

/**
 * Confirmed speakers. Fill this in as the Call for Speakers results land;
 * the Speakers section shows a "coming soon" state while it's empty.
 * Put speaker photos in /public/speakers and reference them here.
 */
export const SPEAKERS: readonly Speaker[] = [];

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
    description: "Pétanque, food and drinks with the community after the sessions.",
    venue: "Boulebar",
    url: "https://www.boulebar.dk/petanque",
    // The venue/plan isn't locked yet; UI shows a "to be confirmed" note.
    confirmed: false,
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
  /** Discord handle, shown as @handle when set. */
  readonly handle?: string;
  readonly role: TeamRole;
  /** Microsoft MVP awardee (renders the MVP badge). */
  readonly mvp?: boolean;
  /** Microsoft Certified Trainer (renders the MCT badge). */
  readonly mct?: boolean;
  /** Part of the summit organising team (gets an "Event team" badge). */
  readonly eventTeam?: boolean;
  /** Full LinkedIn profile URL; renders a LinkedIn link when set. */
  readonly linkedin?: string;
  /** Photo path in /public; falls back to initials avatar when unset. */
  readonly photo?: string;
  /** Country (full name) for the flag, e.g. "Denmark". */
  readonly country?: string;
}

export const TEAM: readonly TeamMember[] = [
  // Moderators
  {
    name: "Philip Marsh",
    handle: "katos.",
    role: "moderator",
    photo: "/team/philip-marsh.jpg",
    country: "United Kingdom",
    linkedin: "https://www.linkedin.com/in/marshsecurity/",
  },
  {
    name: "Joël Prins",
    handle: "joelprins",
    role: "moderator",
    photo: "/team/joel-prins.jpg",
    eventTeam: true,
    country: "Netherlands",
    linkedin: "https://www.linkedin.com/in/jo%C3%ABl-prins-4b4655aa/",
  },
  {
    name: "Jonas Bøgvad",
    handle: "jonasb",
    role: "moderator",
    photo: "/team/jonas-bogvad.jpg",
    mvp: true,
    eventTeam: true,
    country: "Denmark",
    linkedin: "https://www.linkedin.com/in/jonasbogvad/",
  },
  {
    name: "Jay Kerai",
    handle: "darkmodeordie",
    role: "moderator",
    photo: "/team/jay-kerai.jpg",
    mvp: true,
    eventTeam: true,
    country: "United Kingdom",
    linkedin: "https://www.linkedin.com/in/jay-kerai-cyber/",
  },
  // Contributors
  {
    name: "Effie Antoniadi",
    handle: "badfish64",
    role: "contributor",
    photo: "/team/effie-antoniadi.png",
    mct: true,
    eventTeam: true,
    country: "Greece",
    linkedin: "https://www.linkedin.com/in/eantoniadi/",
  },
  {
    name: "Sebastian Flæng Markdanner",
    handle: "taintia",
    role: "contributor",
    photo: "/team/sebastian.jpg",
    mvp: true,
    eventTeam: true,
    country: "Denmark",
    linkedin: "https://www.linkedin.com/in/sebastian-markdanner/",
  },
  {
    name: "Nicklas Olsen",
    handle: "nicklas_olsen",
    role: "contributor",
    photo: "/team/nicklas-olsen.jpg",
    mvp: true,
    country: "Denmark",
    linkedin: "https://www.linkedin.com/in/nicklas-o-40337b205/",
  },
  {
    name: "Sven Visser",
    handle: "falc0n123",
    role: "contributor",
    photo: "/team/sven-visser.jpg",
    country: "Netherlands",
    linkedin: "https://www.linkedin.com/in/sven-visser-36904649/",
  },
  {
    name: "Christian Frohn",
    role: "contributor",
    photo: "/team/christian-frohn.jpg",
    mvp: true,
    country: "Denmark",
    linkedin: "https://www.linkedin.com/in/frohn/",
  },
  { name: "ToastedTy", handle: "toastedty", role: "contributor", country: "United Kingdom" },
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
      "No. The Microsoft EMS Community is an independent, community-run group and is not directly affiliated with Microsoft. The event is kindly hosted by Microsoft near Copenhagen and powered by Microsoft, but it is organized by the community, for the community.",
  },
  {
    question: "How much does it cost?",
    answer:
      "It's a not-for-profit event, priced to cover costs only. Early-bird tickets start at €30 and standard tickets are €40, both including the full day, sessions, lunch and drinks. An optional evening social can be added on. Prices are indicative and confirmed when registration opens. See the Tickets section for the full breakdown.",
  },
  {
    question: "Where exactly is it?",
    answer:
      "At Microsoft, near Copenhagen. The location is confirmed; the full address and travel details will be shared with registered attendees closer to the date.",
  },
  {
    question: "What about the agenda and speakers?",
    answer:
      "The program is being finalized and the Call for Speakers is now open on Sessionize, so if you'd like to present, submit your session via the Call for Speakers section. The full agenda will be published here once it's locked in.",
  },
  {
    question: "How do I get a seat?",
    answer:
      "Seats are limited. Sign up to get notified below, or join the Discord, and you'll be first to hear when registration opens.",
  },
] as const;
