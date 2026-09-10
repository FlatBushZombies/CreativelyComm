import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Google Trends API (alpha) integration.
//
// UNVERIFIED CONTRACT WARNING: unlike lib/translate.ts (DeepL, verified live
// against current docs) or lib/remove-bg.ts (verified live), this endpoint
// shape has NOT been exercised against a real account. Google's official
// Trends API launched in alpha in July 2025
// (developers.google.com/search/blog/2025/07/trends-api) but access is
// application-gated with no self-serve key -- there is currently no way to
// get real credentials to test against. What's implemented below is a
// best-effort reading of the public alpha announcement plus third-party
// early-access reports (e.g. developers.google.com/search/apis/trends,
// which confirms: OAuth 2.0 auth, a rolling 5-year window of interest data
// at daily/weekly/monthly/yearly granularity, geo breakdowns down to
// region/sub-region, and operation-based endpoints under
// `searchtrends.googleapis.com/v1alpha/` where a query is submitted and the
// result is read back from an Operation resource rather than returned
// synchronously). Same disclosure standard as the 5 unverified export
// generators in lib/export/generators.ts: treat this as a starting point to
// re-verify against the real API docs once real alpha credentials are
// granted, not as a guarantee this exact request/response shape is correct.

const TRENDS_API_BASE = "https://searchtrends.googleapis.com/v1alpha";

export interface TrendPoint {
  date: string;
  value: number;
}

export interface TrendRegion {
  countryCode: string;
  countryName: string;
  value: number;
}

export interface FetchedTrends {
  interestOverTime: TrendPoint[];
  topRegions: TrendRegion[];
}

export function isTrendsConfigured(): boolean {
  return Boolean(process.env.GOOGLE_TRENDS_API_KEY);
}

/**
 * Calls the real Google Trends API (alpha) for a given search term. Checked
 * FIRST, before any network call: if GOOGLE_TRENDS_API_KEY is unset, throws
 * immediately rather than attempting a request that would only fail -- same
 * "not configured" pattern as lib/translate.ts's translateText.
 */
export async function fetchProductTrends(searchTerm: string): Promise<FetchedTrends> {
  const apiKey = process.env.GOOGLE_TRENDS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_TRENDS_NOT_CONFIGURED: GOOGLE_TRENDS_API_KEY is not configured."
    );
  }

  // Best-effort request shape (unverified -- see module comment above).
  // The alpha docs describe an operation-based flow: submit the query,
  // then read the result off the returned Operation once it completes.
  const submitResponse = await fetch(
    `${TRENDS_API_BASE}/searchTrends:searchInterestOverTime?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        terms: [searchTerm],
        geoRestriction: { region: [] },
        timeRange: "PAST_12_MONTHS",
      }),
    }
  );

  if (!submitResponse.ok) {
    let message = `Google Trends request failed (${submitResponse.status})`;
    try {
      const body = await submitResponse.json();
      if (body?.error?.message) message = body.error.message;
    } catch {
      // response wasn't JSON; keep the generic status message
    }
    throw new Error(message);
  }

  const body = await submitResponse.json();

  // Best-effort field mapping (unverified): assumes the resolved operation
  // carries a `timeSeries` array (date + interest value) and a
  // `regionInterest` array (geo code/name + relative value), matching the
  // "interest over time" / "interest by region" shapes Trends has exposed
  // historically in its non-API UI/export. Re-verify field names once real
  // alpha access exists.
  const interestOverTime: TrendPoint[] = (body?.timeSeries ?? []).map(
    (point: { date: string; value: number }) => ({
      date: point.date,
      value: point.value,
    })
  );

  const topRegions: TrendRegion[] = (body?.regionInterest ?? []).map(
    (region: { geoCode: string; geoName: string; value: number }) => ({
      countryCode: region.geoCode,
      countryName: region.geoName,
      value: region.value,
    })
  );

  return { interestOverTime, topRegions };
}

interface ProductTrendSnapshotRow {
  id: string;
  product_id: string;
  search_term: string;
  interest_over_time: TrendPoint[];
  top_regions: TrendRegion[];
  fetched_at: string;
  source: string;
}

export interface ProductTrendSnapshot {
  id: string;
  productId: string;
  searchTerm: string;
  interestOverTime: TrendPoint[];
  topRegions: TrendRegion[];
  fetchedAt: string;
  source: string;
}

function mapRow(row: ProductTrendSnapshotRow): ProductTrendSnapshot {
  return {
    id: row.id,
    productId: row.product_id,
    searchTerm: row.search_term,
    interestOverTime: row.interest_over_time ?? [],
    topRegions: row.top_regions ?? [],
    fetchedAt: row.fetched_at,
    source: row.source,
  };
}

export async function getStoredTrendSnapshot(
  productId: string,
  workspaceId: string
): Promise<ProductTrendSnapshot | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_trend_snapshots")
    .select("id, product_id, search_term, interest_over_time, top_regions, fetched_at, source")
    .eq("product_id", productId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load trend snapshot: ${error.message}`);
  }

  return data ? mapRow(data as ProductTrendSnapshotRow) : null;
}

export async function saveTrendSnapshot(
  productId: string,
  workspaceId: string,
  searchTerm: string,
  trends: FetchedTrends
): Promise<ProductTrendSnapshot> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_trend_snapshots")
    .upsert(
      {
        product_id: productId,
        workspace_id: workspaceId,
        search_term: searchTerm,
        interest_over_time: trends.interestOverTime,
        top_regions: trends.topRegions,
        fetched_at: new Date().toISOString(),
        source: "google_trends",
      },
      { onConflict: "product_id" }
    )
    .select("id, product_id, search_term, interest_over_time, top_regions, fetched_at, source")
    .single();

  if (error || !data) {
    throw new Error(`Failed to save trend snapshot: ${error?.message}`);
  }

  return mapRow(data as ProductTrendSnapshotRow);
}
