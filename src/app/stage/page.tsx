import type { Metadata } from "next";
import { RunOfShow } from "@/components/stage/run-of-show";
import { getAgenda } from "@/lib/agenda";
import { buildSegments } from "@/lib/run-of-show";

export const metadata: Metadata = {
  title: "Run of show | Microsoft EMS Community Summit",
  description: "Stage timekeeper for the organizing team.",
  robots: { index: false, follow: false },
};

/**
 * The team's stage timer: which segment is live, how much time is left, how
 * far the day has drifted and what that does to lunch, coffee and the finish.
 * Unlinked and noindex; it holds no secrets, so no login is needed.
 */
export default async function StagePage() {
  const segments = buildSegments(await getAgenda());
  return (
    <main className="flex-1">
      <RunOfShow segments={segments} />
    </main>
  );
}
