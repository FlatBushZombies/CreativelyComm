"use client";

import Link from "next/link";
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
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { dashboardStats, activities } from "@/lib/mock-data";

const activityIcons = {
  optimize: Wand2,
  export: Download,
  publish: Share2,
  upload: Upload,
  share: Share2,
};

const statIcons = [Package, ImageIcon, Eye, Download];

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Welcome back, Jane. Here's your product marketing overview."
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
                    <p className="mt-1 text-xs text-emerald-600">{stat.change}</p>
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
                <Button variant="ghost" size="sm">View all</Button>
              </CardHeader>
              <CardContent>
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

            <Card className="mt-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent/40">
                    <Wand2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">AI Optimization</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    42 images optimized this month. Keep going!
                  </p>
                  <div className="mt-4 h-2 rounded-full bg-border">
                    <div className="h-full w-[70%] rounded-full bg-primary transition-all" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    186 of unlimited used
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
