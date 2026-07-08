"use client";

import {
  Scissors,
  Sun,
  Maximize,
  ImageIcon,
  Square,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { aiFeatures } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  scissors: Scissors,
  sun: Sun,
  maximize: Maximize,
  image: ImageIcon,
  square: Square,
};

export function AIOptimizationPanel() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            AI Optimization Tools
          </CardTitle>
          <Badge variant="muted">Coming soon</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {aiFeatures.map((feature) => {
          const Icon = iconMap[feature.icon] || Wand2;
          return (
            <div
              key={feature.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              {feature.id === "bg-removal" ? (
                <span className="text-xs text-muted-foreground">Use the button on the image above</span>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Apply
                </Button>
              )}
            </div>
          );
        })}
        <Button className="w-full mt-2" disabled>
          <Wand2 className="h-4 w-4" />
          Optimize All Images
        </Button>
      </CardContent>
    </Card>
  );
}
