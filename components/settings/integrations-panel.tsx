"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Check, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { SiShopify, SiQuickbooks, SiGoogle, SiFacebook } from "react-icons/si";
import { FaSlack } from "react-icons/fa6";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { IntegrationSummary, IntegrationProvider } from "@/lib/integrations/store";
import type { ShopifySyncSummary } from "@/lib/integrations/shopify";
import {
  connectShopifyAction,
  connectSlackAction,
  testSlackNotificationAction,
  disconnectIntegrationAction,
  regenerateFeedTokenAction,
  syncAllToShopifyAction,
} from "@/app/(dashboard)/settings/actions";
import posthog from "posthog-js";

function statusBadge(status: IntegrationSummary["status"]) {
  if (status === "connected") return <Badge variant="success">Connected</Badge>;
  if (status === "error") return <Badge variant="destructive">Error</Badge>;
  return <Badge variant="muted">Not connected</Badge>;
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <code className="flex-1 truncate rounded-md bg-muted px-2 py-1.5 text-xs">{value}</code>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}

function findIntegration(integrations: IntegrationSummary[], provider: IntegrationProvider) {
  return integrations.find((i) => i.provider === provider);
}

interface IntegrationsPanelProps {
  integrations: IntegrationSummary[];
  quickbooksConfigured: boolean;
  shopifyOAuthConfigured: boolean;
  shopifySync: ShopifySyncSummary | null;
  googleFeedUrl: string;
  facebookFeedUrl: string;
}

export function IntegrationsPanel({
  integrations,
  quickbooksConfigured,
  shopifyOAuthConfigured,
  shopifySync,
  googleFeedUrl,
  facebookFeedUrl,
}: IntegrationsPanelProps) {
  const shopify = findIntegration(integrations, "shopify");
  const slack = findIntegration(integrations, "slack");
  const quickbooks = findIntegration(integrations, "quickbooks");

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <ShopifyCard integration={shopify} oauthConfigured={shopifyOAuthConfigured} sync={shopifySync} />
      </Suspense>
      <SlackCard integration={slack} />
      <QuickBooksCard integration={quickbooks} configured={quickbooksConfigured} />
      <FeedCard googleFeedUrl={googleFeedUrl} facebookFeedUrl={facebookFeedUrl} />
    </div>
  );
}

function ShopifyCard({
  integration,
  oauthConfigured,
  sync,
}: {
  integration?: IntegrationSummary;
  oauthConfigured: boolean;
  sync: ShopifySyncSummary | null;
}) {
  const [shopDomain, setShopDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [showManualForm, setShowManualForm] = useState(!oauthConfigured);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const connected = integration?.status === "connected";
  const oauthFailed = searchParams.get("shopify") === "error";
  const oauthConnected = searchParams.get("shopify") === "connected";

  function handleSyncAll() {
    setSyncMessage(null);
    startSyncTransition(async () => {
      const result = await syncAllToShopifyAction();
      if (result.error) {
        setSyncMessage(result.error);
        return;
      }
      posthog.capture("shopify_sync_all", { synced: result.synced ?? 0, failed: result.failed ?? 0 });
      const failed = result.failed ?? 0;
      const detail = failed && result.errors?.[0] ? ` ${result.errors[0]}` : "";
      setSyncMessage(
        `Synced ${result.synced ?? 0} product${result.synced === 1 ? "" : "s"}${failed ? `, ${failed} failed` : ""}.${detail}`
      );
      router.refresh();
    });
  }

  function handleConnect() {
    setError(undefined);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("shopDomain", shopDomain);
      formData.set("accessToken", accessToken);
      formData.set("apiSecret", apiSecret);
      const result = await connectShopifyAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      posthog.capture("integration_connected", { provider: "shopify", method: "manual" });
      setShopDomain("");
      setAccessToken("");
      setApiSecret("");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <SiShopify className="h-4 w-4 text-primary" />
            Shopify
          </CardTitle>
          <CardDescription>
            {oauthConfigured
              ? "Two-way product and inventory sync with your own Shopify store."
              : "Two-way product and inventory sync with your own Shopify store — bring your own custom app access token from Settings > Apps > Develop apps in your Shopify admin."}
          </CardDescription>
        </div>
        {statusBadge(integration?.status ?? "disconnected")}
      </CardHeader>
      <CardContent className="space-y-4">
        {oauthConnected && connected && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Shopify connected. Use &quot;Sync all products now&quot; to push your existing catalog to the store.
          </p>
        )}
        {oauthFailed && !connected && (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            Couldn&apos;t connect to Shopify. Please try again.
          </p>
        )}
        {connected ? (
          <>
            <p className="text-sm">
              Connected to <span className="font-medium">{integration?.shopifyShopDomain}</span>
              {integration?.lastSyncedAt && (
                <span className="text-muted-foreground"> · last synced {new Date(integration.lastSyncedAt).toLocaleString()}</span>
              )}
            </p>
            {sync && (
              <div className="rounded-lg border border-border p-3 text-sm">
                <p>
                  <span className="font-medium">{sync.synced}</span> of {sync.total} product{sync.total === 1 ? "" : "s"} on Shopify
                  {sync.failed > 0 && <span className="text-red-600"> · {sync.failed} failed</span>}
                </p>
                {sync.lastError && <p className="mt-1 text-xs text-red-600">{sync.lastError}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  New products, edits, and new photos push automatically. New listings land as drafts on Shopify until you mark them Published here.
                </p>
              </div>
            )}
            {syncMessage && <p className="text-sm text-muted-foreground">{syncMessage}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleSyncAll} disabled={isSyncing}>
                {isSyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                {isSyncing ? "Syncing…" : "Sync all products now"}
              </Button>
              <form action={disconnectIntegrationAction}>
                <input type="hidden" name="provider" value="shopify" />
                <Button type="submit" variant="outline" size="sm">Disconnect</Button>
              </form>
            </div>
          </>
        ) : oauthConfigured && !showManualForm ? (
          <>
            <div>
              <Label htmlFor="oauthShopDomain">Shop domain</Label>
              <Input
                id="oauthShopDomain"
                placeholder="my-store.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild disabled={!shopDomain.trim()}>
                <a
                  href={shopDomain.trim() ? `/api/integrations/shopify/oauth/start?shop=${encodeURIComponent(shopDomain.trim())}` : undefined}
                  className={!shopDomain.trim() ? "pointer-events-none opacity-50" : undefined}
                >
                  <ExternalLink className="h-4 w-4" />
                  Connect with Shopify
                </a>
              </Button>
              <button
                type="button"
                onClick={() => setShowManualForm(true)}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline"
              >
                Or connect with an access token instead
              </button>
            </div>
          </>
        ) : (
          <>
            {oauthConfigured && (
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="text-sm text-primary hover:underline"
              >
                ← Use Connect with Shopify instead
              </button>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label htmlFor="shopDomain">Shop domain</Label>
                <Input id="shopDomain" placeholder="my-store.myshopify.com" value={shopDomain} onChange={(e) => setShopDomain(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="accessToken">Admin API access token</Label>
                <Input id="accessToken" type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="apiSecret">API secret key</Label>
                <Input id="apiSecret" type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={handleConnect} disabled={isPending || !shopDomain || !accessToken || !apiSecret}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Connect Shopify
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SlackCard({ integration }: { integration?: IntegrationSummary }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [testSent, setTestSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const connected = integration?.status === "connected";

  function handleConnect() {
    setError(undefined);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("webhookUrl", webhookUrl);
      const result = await connectSlackAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      posthog.capture("integration_connected", { provider: "slack" });
      setWebhookUrl("");
      router.refresh();
    });
  }

  function handleTest() {
    startTransition(async () => {
      await testSlackNotificationAction();
      posthog.capture("slack_test_message_sent");
      setTestSent(true);
      setTimeout(() => setTestSent(false), 2500);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <FaSlack className="h-4 w-4 text-primary" />
            Slack
          </CardTitle>
          <CardDescription>
            Order and low-stock alerts posted to a channel — bring your own Incoming Webhook
            URL from Slack&apos;s App Directory.
          </CardDescription>
        </div>
        {statusBadge(integration?.status ?? "disconnected")}
      </CardHeader>
      <CardContent className="space-y-4">
        {connected ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleTest} disabled={isPending}>
              {testSent ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : null}
              Send test message
            </Button>
            <form action={disconnectIntegrationAction}>
              <input type="hidden" name="provider" value="slack" />
              <Button type="submit" variant="outline" size="sm">Disconnect</Button>
            </form>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="webhookUrl">Incoming Webhook URL</Label>
              <Input
                id="webhookUrl"
                placeholder="https://hooks.slack.com/services/…"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={handleConnect} disabled={isPending || !webhookUrl}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Connect Slack
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function QuickBooksCard({ integration, configured }: { integration?: IntegrationSummary; configured: boolean }) {
  const connected = integration?.status === "connected";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <SiQuickbooks className="h-4 w-4 text-primary" />
            QuickBooks
          </CardTitle>
          <CardDescription>An invoice is created automatically whenever an order is marked paid.</CardDescription>
        </div>
        {statusBadge(integration?.status ?? "disconnected")}
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <p className="text-sm text-muted-foreground">
            Not available yet — this app needs its own Intuit Developer app first.
            Set <code className="rounded bg-muted px-1">QUICKBOOKS_CLIENT_ID</code>,{" "}
            <code className="rounded bg-muted px-1">QUICKBOOKS_CLIENT_SECRET</code>, and{" "}
            <code className="rounded bg-muted px-1">QUICKBOOKS_REDIRECT_URI</code> to enable this.
          </p>
        ) : connected ? (
          <>
            <p className="text-sm text-muted-foreground">Connected — invoices post automatically.</p>
            <form action={disconnectIntegrationAction}>
              <input type="hidden" name="provider" value="quickbooks" />
              <Button type="submit" variant="outline" size="sm">Disconnect</Button>
            </form>
          </>
        ) : (
          <Button asChild>
            <a href="/api/integrations/quickbooks/authorize">Connect QuickBooks</a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function FeedCard({ googleFeedUrl, facebookFeedUrl }: { googleFeedUrl: string; facebookFeedUrl: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span className="flex items-center -space-x-1">
            <SiGoogle className="h-4 w-4 text-primary" />
            <SiFacebook className="h-4 w-4 text-primary" />
          </span>
          Google Merchant &amp; Meta Catalog
        </CardTitle>
        <CardDescription>
          Paste these into Merchant Center / Commerce Manager as a scheduled-fetch data
          feed — they always reflect your current catalog, no manual re-upload needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="flex items-center gap-1.5">
            <SiGoogle className="h-3.5 w-3.5" />
            Google Merchant Center feed URL
          </Label>
          <div className="mt-1.5">
            <CopyField value={googleFeedUrl} />
          </div>
        </div>
        <div>
          <Label className="flex items-center gap-1.5">
            <SiFacebook className="h-3.5 w-3.5" />
            Meta Catalog feed URL
          </Label>
          <div className="mt-1.5">
            <CopyField value={facebookFeedUrl} />
          </div>
        </div>
        <form
          action={() =>
            startTransition(async () => {
              await regenerateFeedTokenAction();
              posthog.capture("feed_token_regenerated");
              router.refresh();
            })
          }
        >
          <Button type="submit" variant="outline" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Regenerate feed token
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Regenerating breaks the old URL — you&apos;ll need to update it in Merchant Center / Commerce Manager.
        </p>
      </CardContent>
    </Card>
  );
}
