import "server-only";
import { getIntegration, upsertIntegration, disconnectIntegration } from "@/lib/integrations/store";

/**
 * Connects a workspace's own Slack Incoming Webhook (created in their Slack
 * workspace's App Directory -- no OAuth app of ours involved). Posts a real
 * test message before persisting so a bad URL fails at connect time, not
 * silently on the first real notification.
 */
export async function connectSlack(workspaceId: string, webhookUrl: string): Promise<void> {
  if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
    throw new Error("That doesn't look like a Slack Incoming Webhook URL.");
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "CreativelyComm is now connected to this channel." }),
  });

  if (!res.ok) {
    throw new Error(`Slack rejected the webhook (${res.status}). Double-check the URL.`);
  }

  await upsertIntegration(workspaceId, "slack", {
    status: "connected",
    credentials: { webhookUrl },
  });
}

export async function disconnectSlack(workspaceId: string): Promise<void> {
  await disconnectIntegration(workspaceId, "slack");
}

/**
 * Sends a real Slack message if connected; a no-op otherwise. Awaited by
 * every caller but never throws -- a Slack outage should never fail the
 * order/stock operation that triggered it, same contract as logActivity.
 */
export async function notifySlack(workspaceId: string, message: string): Promise<void> {
  try {
    const integration = await getIntegration(workspaceId, "slack");
    if (!integration || integration.status !== "connected") return;

    const webhookUrl = integration.credentials.webhookUrl as string | undefined;
    if (!webhookUrl) return;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!res.ok) {
      console.error(`Slack notification failed (${res.status}) for workspace ${workspaceId}`);
    }
  } catch (err) {
    console.error("Failed to send Slack notification:", err);
  }
}
