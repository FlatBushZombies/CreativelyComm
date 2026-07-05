"use client";

import {
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { exportFormats } from "@/lib/mock-data";

const platformColors: Record<string, string> = {
  shopify: "bg-[#96bf48]",
  woocommerce: "bg-[#96588a]",
  etsy: "bg-[#f56400]",
  amazon: "bg-[#ff9900]",
  google: "bg-[#4285f4]",
  facebook: "bg-[#1877f2]",
  tiktok: "bg-[#000000]",
};

const statusConfig = {
  ready: { label: "Ready", variant: "success" as const, icon: CheckCircle2 },
  exported: { label: "Exported", variant: "default" as const, icon: CheckCircle2 },
  pending: { label: "Pending", variant: "warning" as const, icon: Clock },
};

export default function ExportCenterPage() {
  const readyCount = exportFormats.filter((f) => f.status === "ready" || f.status === "exported").length;

  return (
    <>
      <DashboardHeader
        title="Export Center"
        description="Export marketplace-ready product feeds and images"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold">{exportFormats.length}</p>
                <p className="text-sm text-muted-foreground">Platforms</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold text-emerald-600">{readyCount}</p>
                <p className="text-sm text-muted-foreground">Ready to Export</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold">31</p>
                <p className="text-sm text-muted-foreground">Total Exports</p>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Bulk Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Export all products to all ready platforms at once
                  </p>
                </div>
                <Button>
                  <Download className="h-4 w-4" />
                  Export All Platforms
                </Button>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Last bulk export</span>
                  <span>March 28, 2026</span>
                </div>
                <Progress value={85} />
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exportFormats.map((format) => {
            const status = statusConfig[format.status];
            const StatusIcon = status.icon;

            return (
              <StaggerItem key={format.id}>
                <Card className="h-full transition-all hover:card-shadow-lg hover:border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-white text-xs font-bold ${platformColors[format.icon] || "bg-primary"}`}
                        >
                          {format.platform.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-base">{format.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{format.platform}</p>
                        </div>
                      </div>
                      <Badge variant={status.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {format.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{format.productCount} products</span>
                      {format.lastExported && (
                        <span>Last: {format.lastExported}</span>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={format.status === "pending"}
                      >
                        <RefreshCw className="h-3 w-3" />
                        Sync
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={format.status === "pending"}
                      >
                        <Download className="h-3 w-3" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeIn delay={0.3} className="mt-8">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Facebook Catalog requires setup
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Connect your Meta Business account to enable Facebook Catalog exports.
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  <ExternalLink className="h-3 w-3" />
                  Connect Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </>
  );
}
