import { NextResponse } from "next/server";
import { heartbeatVisitor, removeVisitor, getParticipantCount } from "@/lib/db/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const completed = await getParticipantCount();
    const stats = await heartbeatVisitor("ping-probe");
    return NextResponse.json({ online: stats.online, completed });
  } catch (error) {
    return NextResponse.json({ online: 1, completed: 0, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" && body.sessionId.length > 0
      ? body.sessionId
      : "anonymous";
    const stats = await heartbeatVisitor(sessionId);
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ online: 1, completed: 0, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (typeof body.sessionId === "string") {
      await removeVisitor(body.sessionId);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
