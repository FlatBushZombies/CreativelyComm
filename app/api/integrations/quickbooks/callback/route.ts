import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyState, exchangeCodeForTokens } from "@/lib/integrations/quickbooks";

export async function GET(request: NextRequest) {
  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const settingsUrl = `${origin}/settings?tab=integrations`;

  const code = request.nextUrl.searchParams.get("code");
  const realmId = request.nextUrl.searchParams.get("realmId");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !realmId || !state) {
    return NextResponse.redirect(`${settingsUrl}&error=${encodeURIComponent("Missing OAuth parameters.")}`);
  }

  const workspaceId = verifyState(state);
  if (!workspaceId) {
    return NextResponse.redirect(`${settingsUrl}&error=${encodeURIComponent("Invalid or expired OAuth state.")}`);
  }

  try {
    await exchangeCodeForTokens(workspaceId, code, realmId);
    return NextResponse.redirect(settingsUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect QuickBooks.";
    return NextResponse.redirect(`${settingsUrl}&error=${encodeURIComponent(message)}`);
  }
}
