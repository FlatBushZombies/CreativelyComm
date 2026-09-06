import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { scoreVariant, type CatalogBlocker } from "@/lib/readiness";
import { buildBlockerFixHref } from "@/lib/intelligence";

const BLOCKERS_SHOWN = 3;

interface CatalogHealthCardProps {
  overallScore: number;
  productCount: number;
  topBlockers: CatalogBlocker[];
}

/**
 * Replaces the old static "AI Optimization" promo card: an overall
 * catalog-wide readiness score plus the top few things actually blocking
 * it, each linking straight into the filtered products view to fix them.
 */
export function CatalogHealthCard({ overallScore, productCount, topBlockers }: CatalogHealthCardProps) {
  const preview = topBlockers.slice(0, BLOCKERS_SHOWN);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Catalog Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-3">
            <Progress value={overallScore} className="h-2 flex-1" />
            <Badge variant={scoreVariant(overallScore)}>{overallScore}% ready</Badge>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Average readiness across {productCount} product{productCount === 1 ? "" : "s"}
          </p>
        </div>

        {preview.length === 0 ? (
          <p className="text-sm text-muted-foreground">No catalog-wide blockers found right now.</p>
        ) : (
          <div className="space-y-2">
            {preview.map((blocker) => (
              <div
                key={`${blocker.channel.id}:${blocker.ruleKey}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{blocker.ruleLabel}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {blocker.channel.name} · {blocker.failCount} product{blocker.failCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Link
                  href={buildBlockerFixHref(blocker.productIds)}
                  className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Fix now
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/readiness"
          className="flex items-center justify-between text-sm font-medium text-primary hover:underline"
        >
          View full readiness report
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
