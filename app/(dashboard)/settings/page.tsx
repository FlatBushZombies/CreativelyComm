import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getWorkspaceMembers, getMemberRole } from "@/lib/team";
import { listApiKeys } from "@/lib/api-keys";
import { getVendors } from "@/lib/vendors";
import { listIntegrations } from "@/lib/integrations/store";
import { isShopifyOAuthConfigured, getShopifySyncSummary } from "@/lib/integrations/shopify";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const [members, role, apiKeys, vendors, integrations] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getMemberRole(workspace.id, session.user.id),
    listApiKeys(workspace.id),
    getVendors(workspace.id),
    listIntegrations(workspace.id),
  ]);

  const shopifyConnected = integrations.some((i) => i.provider === "shopify" && i.status === "connected");
  const shopifySync = shopifyConnected ? await getShopifySyncSummary(workspace.id) : null;

  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  return (
    <SettingsClient
      workspace={workspace}
      members={members}
      currentUserId={session.user.id}
      canManageTeam={role === "owner" || role === "admin"}
      apiKeys={apiKeys}
      vendors={vendors}
      canManageVendors={role === "owner" || role === "admin"}
      integrations={integrations}
      quickbooksConfigured={Boolean(process.env.QUICKBOOKS_CLIENT_ID)}
      shopifyOAuthConfigured={isShopifyOAuthConfigured()}
      shopifySync={shopifySync}
      googleFeedUrl={`${origin}/api/feed/${workspace.id}/${workspace.feedToken}/google.xml`}
      facebookFeedUrl={`${origin}/api/feed/${workspace.id}/${workspace.feedToken}/facebook.csv`}
    />
  );
}
