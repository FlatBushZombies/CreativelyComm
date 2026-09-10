"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Loader2, Globe2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductTrendSnapshot } from "@/lib/trends";
import { fetchProductTrendsAction } from "@/app/(dashboard)/products/[id]/actions";

const SPARKLINE_WIDTH = 320;
const SPARKLINE_HEIGHT = 72;
const SPARKLINE_PADDING = 4;

function Sparkline({ points }: { points: { date: string; value: number }[] }) {
  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const innerWidth = SPARKLINE_WIDTH - SPARKLINE_PADDING * 2;
  const innerHeight = SPARKLINE_HEIGHT - SPARKLINE_PADDING * 2;

  const coords = points.map((point, i) => {
    const x = SPARKLINE_PADDING + (points.length === 1 ? 0 : (i / (points.length - 1)) * innerWidth);
    const y = SPARKLINE_PADDING + innerHeight - ((point.value - min) / range) * innerHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lastCoord = coords[coords.length - 1];
  const areaPath = `M${SPARKLINE_PADDING},${SPARKLINE_HEIGHT - SPARKLINE_PADDING} L${coords.join(
    " L"
  )} L${lastCoord.split(",")[0]},${SPARKLINE_HEIGHT - SPARKLINE_PADDING} Z`;

  return (
    <svg
      viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
      className="h-[72px] w-full"
      role="img"
      aria-label="Search interest over time"
    >
      <path d={areaPath} className="fill-primary/10" />
      <polyline
        points={coords.join(" ")}
        fill="none"
        className="stroke-primary"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RegionBar({
  region,
  maxValue,
}: {
  region: { countryCode: string; countryName: string; value: number };
  maxValue: number;
}) {
  const width = maxValue > 0 ? Math.max((region.value / maxValue) * 100, 4) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 shrink-0 text-xs font-medium text-muted-foreground">{region.countryCode}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm">{region.countryName}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{region.value}</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
        </div>
      </div>
    </div>
  );
}

export function MarketTrendsPanel({
  productId,
  configured,
  snapshot,
}: {
  productId: string;
  configured: boolean;
  snapshot: ProductTrendSnapshot | null;
}) {
  const [current, setCurrent] = useState(snapshot);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCheck() {
    setError(undefined);
    startTransition(async () => {
      const result = await fetchProductTrendsAction(productId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.snapshot) {
        setCurrent(result.snapshot);
        router.refresh();
      }
    });
  }

  const maxRegionValue = current ? Math.max(0, ...current.topRegions.map((r) => r.value)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Market Research
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search interest for this product on Google Trends, and the countries where it performs best.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <div className="space-y-3 rounded-lg border border-dashed border-border p-4 text-center">
            <Badge variant="muted" className="mx-auto">
              Pending API access
            </Badge>
            <p className="text-sm text-muted-foreground">
              Google Trends access pending — this connects once API access is approved. Google&apos;s
              Trends API is a gated alpha with no self-serve key yet, so this can&apos;t run for any
              product right now.
            </p>
            <Button size="sm" variant="outline" disabled title="Not available until Google Trends API access is approved">
              Check market interest
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <Button size="sm" onClick={handleCheck} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Checking..." : current ? "Refresh market interest" : "Check market interest"}
              </Button>
              {current && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(current.fetchedAt).toLocaleString()}
                </span>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}

            {!current ? (
              <p className="text-sm text-muted-foreground">
                No market data yet. Check market interest to fetch it.
              </p>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Interest over time — &quot;{current.searchTerm}&quot;
                  </p>
                  {current.interestOverTime.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No time-series data returned.</p>
                  ) : (
                    <Sparkline points={current.interestOverTime} />
                  )}
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Globe2 className="h-3.5 w-3.5" />
                    Top-performing countries
                  </p>
                  {current.topRegions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No regional data returned.</p>
                  ) : (
                    <div className="space-y-3">
                      {current.topRegions.map((region) => (
                        <RegionBar key={region.countryCode} region={region} maxValue={maxRegionValue} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
