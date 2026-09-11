import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Minus, Radar } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { ensureTodaySnapshot, getWeekOverWeekComparison, getProductMovers } from "@/lib/diagnostics";

function DeltaStat({ label, value, format }: { label: string; value: number; format: (n: number) => string }) {
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  const color = value > 0 ? "text-emerald-600" : value < 0 ? "text-red-600" : "text-muted-foreground";

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 flex items-center gap-1 text-xl font-semibold ${color}`}>
        <Icon className="h-4 w-4" />
        {format(Math.abs(value))}
      </p>
    </div>
  );
}

export default async function DiagnosticsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  // Opportunistic write -- no cron exists in this app. Safe to call on every
  // visit: idempotent via unique(workspace_id, snapshot_date) + upsert.
  await ensureTodaySnapshot(workspace.id);

  const [comparison, movers] = await Promise.all([
    getWeekOverWeekComparison(workspace.id),
    getProductMovers(workspace.id),
  ]);

  return (
    <>
      <DashboardHeader
        title="What Changed"
        description="Real week-over-week context from your catalog, orders, and inventory — no guessing, no external data."
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radar className="h-4 w-4 text-primary" />
                This week vs. last week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!comparison.available || !comparison.deltas ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {comparison.current
                    ? "Tracking started today. Check back in about a week to see real week-over-week comparisons — this app doesn't fabricate a baseline."
                    : "Snapshot recorded. Check back tomorrow to start seeing trends."}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  <DeltaStat label="Revenue" value={comparison.deltas.revenue} format={(n) => `$${n.toFixed(2)}`} />
                  <DeltaStat label="Orders" value={comparison.deltas.orders} format={(n) => String(n)} />
                  <DeltaStat label="Views" value={comparison.deltas.views} format={(n) => String(n)} />
                  <DeltaStat
                    label="Avg. Readiness"
                    value={comparison.deltas.readiness}
                    format={(n) => `${n} pts`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Product Movers</CardTitle>
              <p className="text-sm text-muted-foreground">
                The products whose order revenue swung the most this week, with the real context to judge why —
                stock changes and readiness score, not a guess.
              </p>
            </CardHeader>
            <CardContent>
              {movers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No order activity in the last two weeks yet.
                </p>
              ) : (
                <StaggerContainer className="space-y-2">
                  {movers.map((mover) => (
                    <StaggerItem key={mover.product.id}>
                      <Link
                        href={`/products/${mover.product.id}`}
                        className="flex flex-col gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{mover.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${mover.revenueLast7Days.toFixed(2)} this week · ${mover.revenuePrior7Days.toFixed(2)}{" "}
                            last week · {mover.unitsLast7Days} unit{mover.unitsLast7Days === 1 ? "" : "s"} sold
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <Badge variant={mover.revenueChange >= 0 ? "success" : "destructive"}>
                            {mover.revenueChange >= 0 ? "+" : "-"}${Math.abs(mover.revenueChange).toFixed(2)}
                          </Badge>
                          {mover.currentStock !== null && (
                            <Badge variant={mover.currentStock <= 5 ? "warning" : "muted"}>
                              {mover.currentStock} in stock
                              {mover.recentStockChange && mover.recentStockChange !== 0
                                ? ` (${mover.recentStockChange > 0 ? "+" : ""}${mover.recentStockChange})`
                                : ""}
                            </Badge>
                          )}
                          <Badge variant={mover.readinessScore >= 80 ? "success" : mover.readinessScore >= 50 ? "warning" : "destructive"}>
                            {mover.readinessScore}% ready
                          </Badge>
                        </div>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}
