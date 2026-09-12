import { NextResponse } from "next/server";
import { getParticipantCount, incrementParticipantCount } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getParticipantCount();
    return NextResponse.json({ count });
  } catch (error) {
    return NextResponse.json({ count: 0, error: String(error) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const count = await incrementParticipantCount();
    return NextResponse.json({ count, success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
