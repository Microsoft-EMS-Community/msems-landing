import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { speakerTopics } from "@/lib/event";
import { resolvePhoto } from "@/lib/card-photo";
import { TOPIC_MAX_CHARS } from "@/lib/card-text";
import {
  PortraitCard,
  TAGLINE_MAX_CHARS,
  cardImageOptions,
  loadCardChrome,
} from "@/lib/card-chrome";

// A 1080x1350 "speaker announcement" card for the team to post. Same
// composition as /speaker-card so the two read as one event; the eyebrow is
// what marks this as the team revealing someone rather than a self-post.
//  - GET  ?name=&topic=&title=&photo=  (photo = /public path or https URL)
//  - POST { name, topic, title, photo } (photo can also be a data: URL)
export const dynamic = "force-dynamic";

const EYEBROW = "Speaker announcement";

async function renderCard(
  nameRaw: string,
  topicRaw: string,
  photoRaw: string | null,
  taglineRaw: string,
) {
  const name = nameRaw.trim().slice(0, 40);
  if (!name) {
    return new Response("A speaker name is required.", { status: 400 });
  }

  const chrome = await loadCardChrome();
  return new ImageResponse(
    (
      <PortraitCard
        chrome={chrome}
        eyebrow={EYEBROW}
        name={name}
        topic={topicRaw.trim().slice(0, TOPIC_MAX_CHARS)}
        tagline={taglineRaw.trim().slice(0, TAGLINE_MAX_CHARS)}
        photoSrc={await resolvePhoto(photoRaw)}
        topics={speakerTopics(name)}
      />
    ),
    cardImageOptions(chrome),
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return renderCard(
    sp.get("name") ?? "",
    sp.get("topic") ?? "",
    sp.get("photo"),
    sp.get("title") ?? "",
  );
}

interface AnnounceBody {
  name?: unknown;
  topic?: unknown;
  photo?: unknown;
  title?: unknown;
}

export async function POST(request: Request) {
  let body: AnnounceBody;
  try {
    body = (await request.json()) as AnnounceBody;
  } catch {
    body = {};
  }
  return renderCard(
    typeof body.name === "string" ? body.name : "",
    typeof body.topic === "string" ? body.topic : "",
    typeof body.photo === "string" ? body.photo : null,
    typeof body.title === "string" ? body.title : "",
  );
}
