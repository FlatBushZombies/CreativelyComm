import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getRecentActivity } from "@/lib/activity";

// Route Handlers under app/api/** are never touched by proxy.ts (its matcher
// excludes "api"), so this route checks the session itself.
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const activity = await getRecentActivity(workspace.id, 8);

  return NextResponse.json({ activity });
}
