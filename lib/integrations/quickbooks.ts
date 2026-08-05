import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getIntegration, upsertIntegration, markIntegrationError } from "@/lib/integrations/store";

/**
 * QuickBooks Online is OAuth-only -- there is no API-key alternative. This
 * requires an Intuit Developer app the operator registers themselves
 * (developer.intuit.com), since the OAuth authorize redirect has to include
 * a real client_id. Every function here throws QUICKBOOKS_NOT_CONFIGURED
 * until those env vars exist -- this integration is honestly non-functional
 * out of the box, not stubbed or faked.
 */

const AUTHORIZE_URL = "https://appcenter.intuit.com/connect/oauth2";
const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const API_BASE = "https://quickbooks.api.intuit.com/v3/company";

function requireConfig() {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "QUICKBOOKS_NOT_CONFIGURED: set QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET, and QUICKBOOKS_REDIRECT_URI (from your own Intuit Developer app) to enable QuickBooks."
    );
  }
  return { clientId, clientSecret, redirectUri };
}

function signState(workspaceId: string): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? "";
  const signature = createHmac("sha256", secret).update(workspaceId).digest("hex");
  return Buffer.from(`${workspaceId}.${signature}`).toString("base64url");
}

export function verifyState(state: string): string | null {
  try {
    const [workspaceId, signature] = Buffer.from(state, "base64url").toString("utf8").split(".");
    const secret = process.env.BETTER_AUTH_SECRET ?? "";
    const expected = createHmac("sha256", secret).update(workspaceId).digest("hex");
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return workspaceId;
  } catch {
    return null;
  }
}

export function buildAuthorizeUrl(workspaceId: string): string {
  const { clientId, redirectUri } = requireConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    redirect_uri: redirectUri,
    state: signState(workspaceId),
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(workspaceId: string, code: string, realmId: string): Promise<void> {
  const { clientId, clientSecret, redirectUri } = requireConfig();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });

  if (!res.ok) {
    throw new Error(`QuickBooks token exchange failed (${res.status}).`);
  }

  const tokens = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };

  await upsertIntegration(workspaceId, "quickbooks", {
    status: "connected",
    credentials: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token },
    config: {
      realmId,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    },
  });
}

async function refreshAccessTokenIfNeeded(workspaceId: string): Promise<{ accessToken: string; realmId: string }> {
  const { clientId, clientSecret } = requireConfig();
  const integration = await getIntegration(workspaceId, "quickbooks");
  if (!integration || integration.status !== "connected") {
    throw new Error("QuickBooks is not connected for this workspace.");
  }

  const realmId = integration.config.realmId as string;
  const expiresAt = new Date((integration.config.expiresAt as string) ?? 0).getTime();

  if (Date.now() < expiresAt - 60_000) {
    return { accessToken: integration.credentials.accessToken as string, realmId };
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: integration.credentials.refreshToken as string,
    }),
  });

  if (!res.ok) {
    await markIntegrationError(workspaceId, "quickbooks", `Token refresh failed (${res.status}). Reconnect required.`);
    throw new Error("QuickBooks token refresh failed.");
  }

  const tokens = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  await upsertIntegration(workspaceId, "quickbooks", {
    status: "connected",
    credentials: { accessToken: tokens.access_token, refreshToken: tokens.refresh_token },
    config: { realmId, expiresAt: new Date(Date.now() + tokens.expires_in * 1000).toISOString() },
  });

  return { accessToken: tokens.access_token, realmId };
}

export interface QuickBooksOrderInput {
  id: string;
  customerName: string | null;
  total: number;
}

const SALES_ITEM_NAME = "CreativelyComm Sales";

async function getFirstIncomeAccountId(headers: Record<string, string>, realmId: string): Promise<string> {
  const query = "select * from Account where AccountType = 'Income' maxresults 1";
  const res = await fetch(`${API_BASE}/${realmId}/query?query=${encodeURIComponent(query)}`, { headers });
  if (res.ok) {
    const data = (await res.json()) as { QueryResponse?: { Account?: { Id: string }[] } };
    const account = data.QueryResponse?.Account?.[0];
    if (account) return account.Id;
  }
  throw new Error("This QuickBooks company has no income account to post sales against.");
}

async function getOrCreateSalesItem(accessToken: string, realmId: string): Promise<string> {
  const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/json", "Content-Type": "application/json" };
  const query = `select * from Item where Name = '${SALES_ITEM_NAME}'`;
  const queryRes = await fetch(`${API_BASE}/${realmId}/query?query=${encodeURIComponent(query)}`, { headers });
  if (queryRes.ok) {
    const data = (await queryRes.json()) as { QueryResponse?: { Item?: { Id: string }[] } };
    const existing = data.QueryResponse?.Item?.[0];
    if (existing) return existing.Id;
  }

  const incomeAccountId = await getFirstIncomeAccountId(headers, realmId);
  const createRes = await fetch(`${API_BASE}/${realmId}/item`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      Name: SALES_ITEM_NAME,
      Type: "Service",
      IncomeAccountRef: { value: incomeAccountId },
    }),
  });
  if (!createRes.ok) {
    throw new Error(`Failed to create a default QuickBooks sales item (${createRes.status}).`);
  }
  const created = (await createRes.json()) as { Item: { Id: string } };
  return created.Item.Id;
}

const GENERIC_CUSTOMER_NAME = "CreativelyComm Walk-in Customer";

async function getOrCreateGenericCustomer(accessToken: string, realmId: string): Promise<string> {
  const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/json", "Content-Type": "application/json" };
  const query = `select * from Customer where DisplayName = '${GENERIC_CUSTOMER_NAME}'`;
  const queryRes = await fetch(`${API_BASE}/${realmId}/query?query=${encodeURIComponent(query)}`, { headers });
  if (queryRes.ok) {
    const data = (await queryRes.json()) as { QueryResponse?: { Customer?: { Id: string }[] } };
    const existing = data.QueryResponse?.Customer?.[0];
    if (existing) return existing.Id;
  }

  const createRes = await fetch(`${API_BASE}/${realmId}/customer`, {
    method: "POST",
    headers,
    body: JSON.stringify({ DisplayName: GENERIC_CUSTOMER_NAME }),
  });
  if (!createRes.ok) {
    throw new Error(`Failed to create a default QuickBooks customer (${createRes.status}).`);
  }
  const created = (await createRes.json()) as { Customer: { Id: string } };
  return created.Customer.Id;
}

/**
 * Creates a QuickBooks Invoice for an order that just reached "paid". Line
 * items map to a single generic sales item (real per-product Item mapping
 * is future work, not in scope here) since there's no product-to-QuickBooks
 * Item mapping UI. Never throws to its caller -- error-isolated.
 */
export async function createInvoiceForOrder(workspaceId: string, order: QuickBooksOrderInput): Promise<void> {
  try {
    const { accessToken, realmId } = await refreshAccessTokenIfNeeded(workspaceId);
    const [itemId, customerId] = await Promise.all([
      getOrCreateSalesItem(accessToken, realmId),
      getOrCreateGenericCustomer(accessToken, realmId),
    ]);

    const res = await fetch(`${API_BASE}/${realmId}/invoice`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        Line: [
          {
            Amount: order.total,
            DetailType: "SalesItemLineDetail",
            SalesItemLineDetail: { ItemRef: { value: itemId } },
            Description: order.customerName ? `Order for ${order.customerName}` : `Order ${order.id.slice(0, 8)}`,
          },
        ],
        CustomerRef: { value: customerId },
      }),
    });

    if (!res.ok) {
      await markIntegrationError(workspaceId, "quickbooks", `Failed to create invoice for order (${res.status}).`);
      return;
    }

    const { Invoice } = (await res.json()) as { Invoice: { Id: string } };
    const supabase = getSupabaseServerClient();
    await supabase.from("orders").update({ quickbooks_invoice_id: Invoice.Id }).eq("id", order.id);
  } catch (err) {
    console.error("Failed to create QuickBooks invoice:", err);
  }
}
