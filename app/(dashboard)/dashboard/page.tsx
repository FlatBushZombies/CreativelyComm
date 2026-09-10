import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Package,
  ImageIcon,
  Eye,
  Download,
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
  Flame,
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

// Same source photo as the landing page hero, for visual consistency between
// the marketing site and the dashboard.
const HERO_IMAGE = "https://images.pexels.com/photos/7289725/pexels-photo-7289725.jpeg?auto=compress&cs=tinysrgb&w=1800";

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

// One pastel tile theme per stat card, in the same on-brand hue family as
// the folder/feature-tile gradients elsewhere on the site (lib/folder-utils.ts),
// just in light-tint form for a soft "pastel tile" look instead of a solid fill.
const statTileThemes = [
  { bg: "#eef4ef", icon: "#386641", href: "/products" }, // primary green
  { bg: "#e9f4f3", icon: "#2f6b66", href: "/products" }, // teal
  { bg: "#f7ece4", icon: "#a85a34", href: "/storefront" }, // clay
  { bg: "#f9f1e0", icon: "#a9822f", href: "/export" }, // amber
];
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

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const mostViewedProducts = [...products]
    .filter((p) => p.views > 0)
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)
    .map((product) => {
      const readiness = intelligence.readiness.products.find((p) => p.product.id === product.id);
      return { product, readinessScore: readiness?.averageScore ?? 0 };
    });

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description={`Welcome back, ${firstName}. Here's what's blocking your catalog from selling more.`}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Hero banner */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl">
            <div className="relative min-h-[260px] p-6 sm:min-h-[300px] sm:p-10">
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                priority
                className="object-cover object-[75%_25%]"
                sizes="(max-width: 1024px) 100vw, 1200px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-foreground/20" />

              <div className="relative max-w-md">
                <p className="text-sm text-white/80">Good morning, {firstName} 👋</p>
                <h1 className="font-display mt-2 text-2xl font-medium tracking-tight text-white sm:text-3xl">
                  Your catalog, at a glance.
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-white/75">
                  {products.length} product{products.length === 1 ? "" : "s"} tracked — see what&apos;s
                  ready, what&apos;s blocked, and what to fix next.
                </p>
                <Button size="sm" className="mt-5 rounded-full bg-white px-5 text-foreground hover:bg-white/90" asChild>
                  <Link href="/products">
                    Go to products
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="absolute bottom-6 right-6 hidden rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                  Catalog readiness
                </p>
                <p className="font-display mt-0.5 text-2xl font-medium text-white">{overallReadinessScore}%</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Stat tiles */}
        <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat, i) => {
            const Icon = statIcons[i];
            const theme = statTileThemes[i];
            return (
              <StaggerItem key={stat.label}>
                <Link href={theme.href}>
                  <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:card-shadow-lg">
                    <CardContent className="p-6" style={{ backgroundColor: theme.bg }}>
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                      >
                        <Icon className="h-5 w-5" style={{ color: theme.icon }} />
                      </div>
                      <p className="font-display mt-4 text-2xl font-medium">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Recent Products + Recent Activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <FadeIn className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Recent Products</CardTitle>
                <Link href="/products" className="text-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {recentProducts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No products yet. Add your first product to get started.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {recentProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group block overflow-hidden rounded-xl border border-border transition-colors hover:border-border-strong"
                      >
                        <div className="relative aspect-square bg-muted">
                          {(product.optimizedImages[0] ?? product.images[0]) && (
                            <Image
                              src={product.optimizedImages[0] ?? product.images[0]}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="180px"
                            />
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <Badge variant={product.status === "optimized" ? "success" : "muted"} className="mt-1.5 text-[10px]">
                            {product.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.05}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Activity will show up here as you add products, optimize images, and export.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map((activity) => {
                      const Icon = activityIcons[activity.type];
                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{activity.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{activity.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Insights: most-viewed products + catalog health */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.05}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  Most Viewed Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mostViewedProducts.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Product views will show up here once your storefront gets traffic.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mostViewedProducts.map(({ product, readinessScore }, i) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent/50"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {i + 1}
                          </span>
                          <p className="truncate font-medium">{product.name}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {product.views} view{product.views === 1 ? "" : "s"} · {readinessScore}% ready
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <CatalogHealthCard
              overallScore={overallReadinessScore}
              productCount={products.length}
              topBlockers={intelligence.readiness.topBlockers}
            />
          </FadeIn>
        </div>

        {/* Quick Actions + Low Stock */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.05}>
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
                  <Button key={action.label} variant="outline" className="w-full justify-between" asChild>
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
          </FadeIn>

          <FadeIn delay={0.1}>
            {lowStockProducts.length > 0 ? (
              <Card>
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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Low Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nothing running low right now.
                  </p>
                </CardContent>
              </Card>
            )}
          </FadeIn>
        </div>

        {/* Top Blockers + Conversion Gaps */}
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
