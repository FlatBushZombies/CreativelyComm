import type { NextRequest } from "next/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateApiRequest } from "@/lib/api-auth";
import { registerTools } from "@/lib/mcp/tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(status: number, message: string, headers?: Record<string, string>) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

/**
 * MCP server (Streamable HTTP, stateless) so a merchant's own AI agent --
 * Claude, ChatGPT, Meta Muse, Cursor -- can read their catalog intelligence and
 * run confirm-gated fixes. Auth is the same workspace API key as /api/v1
 * (Settings > API): route handlers under app/api/** aren't covered by proxy.ts,
 * so this authenticates itself.
 *
 * Stateless: a fresh server + transport per request, no session id, so it works
 * on serverless without sticky routing.
 */
export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return jsonError(401, "Missing or invalid API key. Send 'Authorization: Bearer <key>' (create one in Settings > API).", {
      "www-authenticate": 'Bearer realm="CreativelyComm MCP"',
    });
  }

  const server = new McpServer({ name: "creativelycomm", version: "1.0.0" });
  registerTools(server, auth.workspaceId);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);

  try {
    return await transport.handleRequest(request);
  } finally {
    // Response is fully materialized (JSON mode), so the per-request server can go.
    await transport.close();
    await server.close();
  }
}

// Stateless server: no standalone SSE stream and no session to terminate.
export async function GET() {
  return jsonError(405, "This MCP endpoint is stateless; use POST.", { allow: "POST" });
}

export async function DELETE() {
  return jsonError(405, "This MCP endpoint is stateless; use POST.", { allow: "POST" });
}
