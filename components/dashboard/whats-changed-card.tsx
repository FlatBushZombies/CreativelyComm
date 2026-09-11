import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WeekOverWeekComparison, ProductMover } from "@/lib/diagnostics";

const MOVERS_SHOWN = 2;

interface WhatsChangedCardProps {
  comparison: WeekOverWeekComparison;
  topMovers: ProductMover[];
}

export function WhatsChangedCard({ comparison, topMovers }: WhatsChangedCardProps) {
  const preview = topMovers.slice(0, MOVERS_SHOWN);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Radar className="h-4 w-4 text-primary" />
          What Changed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comparison.available && comparison.deltas ? (
          <p className="text-sm">
            Revenue{" "}
            <span className={comparison.deltas.revenue >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
              {comparison.deltas.revenue >= 0 ? "+" : "-"}${Math.abs(comparison.deltas.revenue).toFixed(2)}
            </span>{" "}
            vs. last week
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Building week-over-week history — check back in a few days.
          </p>
        )}

        {preview.length === 0 ? (
          <p className="text-sm text-muted-foreground">No order activity to compare yet.</p>
        ) : (
          <div className="space-y-2">
            {preview.map((mover) => (
              <div key={mover.product.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                <p className="truncate text-sm font-medium">{mover.product.name}</p>
                <Badge variant={mover.revenueChange >= 0 ? "success" : "destructive"} className="shrink-0">
                  {mover.revenueChange >= 0 ? "+" : "-"}${Math.abs(mover.revenueChange).toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/diagnostics"
          className="flex items-center justify-between text-sm font-medium text-primary hover:underline"
        >
          View full report
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
