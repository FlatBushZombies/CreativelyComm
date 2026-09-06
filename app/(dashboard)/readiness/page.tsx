import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderKanban, ShieldAlert, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getAllChannels, getCustomRulesByChannel, scoreVariant } from "@/lib/readiness";
import { getIntelligenceOverview, buildBlockerFixHref, buildFolderFixHref } from "@/lib/intelligence";
import { ManageRules } from "@/components/readiness/manage-rules";

export default async function ReadinessOverviewPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const [intelligence, channels, customRules] = await Promise.all([
    getIntelligenceOverview(workspace.id),
    getAllChannels(),
    getCustomRulesByChannel(workspace.id),
  ]);
  const { readiness, folderRollup } = intelligence;

  return (
    <>
      <DashboardHeader
        title="Channel Readiness"
        description="How ready your catalog is to list on each marketplace"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Catalog readiness by channel
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Average listing-quality score across your whole catalog — a starting point to
                tune, not a guarantee of any marketplace&apos;s current policies.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {readiness.channelAverages.map(({ channel, averageScore }) => (
                <div key={channel.id} className="flex items-center gap-4">
                  <span className="w-36 shrink-0 text-sm font-medium">{channel.name}</span>
                  <Progress value={averageScore} className="h-2 flex-1" />
                  <span className="w-12 shrink-0 text-right text-sm font-medium">
                    {averageScore}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.08} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Top blockers
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                The specific listing-quality rules failing across the most products, worst first.
              </p>
            </CardHeader>
            <CardContent>
              {readiness.topBlockers.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No catalog-wide blockers found right now.
                </p>
              ) : (
                <div className="space-y-2">
                  {readiness.topBlockers.map((blocker) => (
                    <div
                      key={`${blocker.channel.id}:${blocker.ruleKey}`}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {blocker.ruleLabel} <span className="text-muted-foreground">· {blocker.channel.name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {blocker.failCount} product{blocker.failCount === 1 ? "" : "s"} ({Math.round(blocker.failRate * 100)}% of catalog)
                        </p>
                      </div>
                      <Link
                        href={buildBlockerFixHref(blocker.productIds)}
                        className="shrink-0 text-sm font-medium text-primary hover:underline"
                      >
                        Fix these products
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.11} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                Readiness by folder
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Average readiness score per product folder (category).
              </p>
            </CardHeader>
            <CardContent>
              {folderRollup.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Add products to see readiness broken down by folder here.
                </p>
              ) : (
                <div className="space-y-2">
                  {folderRollup.map((folder) => (
                    <Link
                      key={folder.folderKey}
                      href={buildFolderFixHref(folder.folderKey)}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{folder.folderKey}</p>
                        <p className="text-xs text-muted-foreground">
                          {folder.productCount} product{folder.productCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Badge variant={scoreVariant(folder.averageScore)} className="shrink-0">
                        {folder.averageScore}% ready
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.14} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Products that need the most work</CardTitle>
            </CardHeader>
            <CardContent>
              {readiness.products.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Add products to see their readiness scores here.
                </p>
              ) : (
                <StaggerContainer className="space-y-3">
                  {readiness.products.map(({ product, averageScore }) => (
                    <StaggerItem key={product.id}>
                      <Link
                        href={`/products/${product.id}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                        <Badge variant={scoreVariant(averageScore)}>{averageScore}% ready</Badge>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.17} className="mt-6">
          <ManageRules channels={channels} customRules={customRules} />
        </FadeIn>
      </div>
    </>
  );
}
