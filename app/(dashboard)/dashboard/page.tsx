import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  ImageIcon,
  Eye,
  Download,
  TrendingUp,
  Upload,
  Wand2,
  Share2,
  ArrowRight,
  FileSpreadsheet,
  AlertTriangle,
  ShoppingCart,
  Plug,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { CatalogHealthCard } from "@/components/dashboard/catalog-health-card";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getDashboardStats } from "@/lib/stats";
import { getRecentActivity } from "@/lib/activity";
import { getLowStockProducts } from "@/lib/inventory";
import { getProducts } from "@/lib/products";
import { getIntelligenceOverview, buildBlockerFixHref, type ConversionGapSignal } from "@/lib/intelligence";

const conversionGapLabel: Record<ConversionGapSignal["classification"], string> = {
  "high-traffic-zero-sales": "High traffic, zero sales",
  "low-readiness-zero-sales": "Incomplete listing, zero sales",
};

const activityIcons = {
  optimize: Wand2,
  export: Download,
  publish: Share2,
  upload: Upload,
  share: Share2,
  import: FileSpreadsheet,
  low_stock: AlertTriangle,
  order: ShoppingCart,
  integration: Plug,
};

const statIcons = [Package, ImageIcon, Eye, Download];

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const [dashboardStats, activities, lowStockProducts, products, intelligence] = await Promise.all([
    getDashboardStats(workspace.id),
    getRecentActivity(workspace.id),
    getLowStockProducts(workspace.id),
    getProducts(workspace.id),
    getIntelligenceOverview(workspace.id),
  ]);
  const firstName = session.user.name.split(" ")[0];

  const overallReadinessScore = intelligence.readiness.products.length
    ? Math.round(
        intelligence.readiness.products.reduce((sum, p) => sum + p.averageScore, 0) /
          intelligence.readiness.products.length
      )
    : 0;
  const topConversionGaps = intelligence.conversionGaps.slice(0, 5);

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here's what's blocking your catalog from selling more.`}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat, i) => {
            const Icon = statIcons[i];
            return (
              <StaggerItem key={stat.label}>
                <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:card-shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/40">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {stat.trend === "up" && (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <p className="font-display mt-4 text-2xl font-medium">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {stat.change && (
                      <p className="mt-1 text-xs text-emerald-600">{stat.change}</p>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <FadeIn className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Activity will show up here as you add products, optimize images, and export.
                  </p>
                ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const Icon = activityIcons[activity.type];
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/40">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          {activity.productName && (
                            <Badge variant="muted" className="mt-1.5">
                              {activity.productName}
                            </Badge>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {activity.timestamp}
                        </span>
                      </div>
                    );
                  })}
                </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Upload new product", href: "/products", icon: Upload },
                  { label: "Optimize images", href: "/products", icon: Wand2 },
                  { label: "Export to platforms", href: "/export", icon: Download },
                  { label: "Preview storefront", href: "/storefront", icon: Eye },
                ].map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="w-full justify-between"
                    asChild
                  >
                    <Link href={action.href}>
                      <span className="flex items-center gap-2">
                        <action.icon className="h-4 w-4 text-primary" />
                        {action.label}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {lowStockProducts.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Low Stock
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lowStockProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center justify-between rounded-lg p-2 text-sm transition-colors hover:bg-accent/50"
                    >
                      <span className="truncate">{product.name}</span>
                      <Badge variant="warning">{product.stockQuantity} left</Badge>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="mt-6">
              <CatalogHealthCard
                overallScore={overallReadinessScore}
                productCount={products.length}
                topBlockers={intelligence.readiness.topBlockers}
              />
            </div>
          </FadeIn>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.05}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-primary" />
                  Top Blockers
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  The specific listing-quality rules failing across the most products.
                </p>
              </CardHeader>
              <CardContent>
                {intelligence.readiness.topBlockers.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No catalog-wide blockers found right now.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {intelligence.readiness.topBlockers.map((blocker) => (
                      <Link
                        key={`${blocker.channel.id}:${blocker.ruleKey}`}
                        href={buildBlockerFixHref(blocker.productIds)}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{blocker.ruleLabel}</p>
                          <p className="truncate text-xs text-muted-foreground">{blocker.channel.name}</p>
                        </div>
                        <Badge variant="warning" className="shrink-0">
                          {blocker.failCount} product{blocker.failCount === 1 ? "" : "s"}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-primary" />
                  Conversion Gaps
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Products with zero sales that either look listing-ready or clearly aren&apos;t.
                </p>
              </CardHeader>
              <CardContent>
                {topConversionGaps.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No conversion-gap signals right now.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topConversionGaps.map((gap) => (
                      <Link
                        key={gap.product.id}
                        href={`/products/${gap.product.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{gap.product.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {gap.views} view{gap.views === 1 ? "" : "s"} · {gap.readinessScore}% ready
                          </p>
                        </div>
                        <Badge
                          variant={gap.classification === "high-traffic-zero-sales" ? "warning" : "destructive"}
                          className="shrink-0"
                        >
                          {conversionGapLabel[gap.classification]}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
