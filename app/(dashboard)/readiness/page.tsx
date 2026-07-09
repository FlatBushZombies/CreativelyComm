import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProducts } from "@/lib/products";
import { getReadinessOverview } from "@/lib/readiness";

function scoreVariant(score: number): "success" | "warning" | "destructive" {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "destructive";
}

export default async function ReadinessOverviewPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const products = await getProducts(workspace.id);
  const overview = await getReadinessOverview(products);

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
              {overview.channelAverages.map(({ channel, averageScore }) => (
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

        <FadeIn delay={0.1} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Products that need the most work</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.products.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Add products to see their readiness scores here.
                </p>
              ) : (
                <StaggerContainer className="space-y-3">
                  {overview.products.map(({ product, averageScore }) => (
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
      </div>
    </>
  );
}
