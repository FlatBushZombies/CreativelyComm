import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicAudit } from "@/lib/public-audit";
import { scoreVariant } from "@/lib/readiness";
import { AuditSignupCta, AuditViewedTracker } from "./audit-cta";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const audit = await getPublicAudit(id);
  if (!audit) return { title: "Audit not found" };
  return {
    title: `${audit.domain} listing audit: ${audit.avgScore}% ready — CreativelyComm`,
    description: `${audit.readyCount} of ${audit.productCount} products on ${audit.domain} are ready to list across sales channels.`,
    // A share link for the store owner, not something to index.
    robots: { index: false, follow: false },
  };
}

const scoreColor = { success: "text-emerald-600", warning: "text-amber-600", destructive: "text-red-600" } as const;
const barColor = { success: "bg-emerald-500", warning: "bg-amber-500", destructive: "bg-red-500" } as const;

export default async function AuditResultPage({ params }: Params) {
  const { id } = await params;
  const audit = await getPublicAudit(id);
  if (!audit) notFound();

  const variant = scoreVariant(audit.avgScore);

  return (
    <div className="min-h-screen">
      <LandingNav />
      <AuditViewedTracker auditId={audit.id} avgScore={audit.avgScore} />
      <main className="hero-gradient">
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:px-6 sm:pt-40">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Listing audit</p>
          <h1 className="font-display mt-2 break-words text-2xl font-medium tracking-tight sm:text-4xl">{audit.domain}</h1>

          <Card className="mt-8">
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className={`font-display text-6xl font-medium leading-none ${scoreColor[variant]}`}>{audit.avgScore}%</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  average readiness across {audit.channelScores.length} sales channels
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm sm:text-right">
                <div>
                  <p className="text-2xl font-semibold">
                    {audit.readyCount}
                    <span className="text-base font-normal text-muted-foreground"> / {audit.productCount}</span>
                  </p>
                  <p className="text-muted-foreground">products listing-ready</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{audit.issuesTotal}</p>
                  <p className="text-muted-foreground">issues found</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By channel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {audit.channelScores.map((c) => (
                  <div key={c.channel}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{c.channel}</span>
                      <span className="text-muted-foreground">{c.score}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${barColor[scoreVariant(c.score)]}`} style={{ width: `${c.score}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">What&apos;s holding listings back</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {audit.topBlockers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No blockers found. Nice work.</p>
                ) : (
                  audit.topBlockers.map((b) => (
                    <div key={`${b.channel}:${b.ruleKey}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{b.rule}</span>
                        <Badge variant="muted">{b.channel}</Badge>
                        <Badge variant="destructive">
                          {b.failCount} product{b.failCount === 1 ? "" : "s"} ({Math.round(b.failRate * 100)}%)
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{b.advice}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {audit.worstProducts.length > 0 && audit.worstProducts[0].score < 100 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Products to fix first</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {audit.worstProducts.map((p, i) => (
                  <div key={`${p.title}-${i}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{p.title}</span>
                    <Badge variant={scoreVariant(p.score)}>{p.score}% ready</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="mt-6 border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-xl font-medium">
                  {audit.issuesFixable > 0
                    ? `We can clear ${audit.issuesFixable} of these ${audit.issuesTotal} issues automatically.`
                    : "Keep every listing channel-ready as your catalog grows."}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your store to fix missing SKUs, tags, categories and short descriptions in one click. Photos and
                  prices stay yours to decide.
                </p>
              </div>
              <AuditSignupCta auditId={audit.id} label="Fix these in one click" />
            </CardContent>
          </Card>

          <p className="mt-6 text-xs text-muted-foreground">
            Scored from {audit.domain}&apos;s public product feed (up to the first 250 products) against default channel
            requirements: SKU, price, photos, description length, tags and category. These are practical checks, not official
            marketplace policy, and only cover what the public feed shows.{" "}
            <Link href="/audit" className="underline">
              Audit another store
            </Link>
            .
          </p>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
