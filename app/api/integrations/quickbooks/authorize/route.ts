import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { buildAuthorizeUrl } from "@/lib/integrations/quickbooks";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  try {
    const url = buildAuthorizeUrl(workspace.id);
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "QuickBooks is not configured.";
    return NextResponse.redirect(
      `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/settings?tab=integrations&error=${encodeURIComponent(message)}`
    );
  }
}
