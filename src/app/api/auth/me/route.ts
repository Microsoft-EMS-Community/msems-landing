import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Current verified Discord identity, or { user: null } when logged out. */
export async function GET(): Promise<NextResponse> {
  const user = await getSession();
  return NextResponse.json({ user });
}
