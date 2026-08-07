"use client";

import { useState } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Camera,
  Barcode,
  Eye,
  CreditCard,
  Package,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { HARDWARE_FEATURES, HardwareFeature } from "@/lib/hardware";
import { cn } from "@/lib/utils";

const featureIcons: Record<HardwareFeature, React.ReactNode> = {
  "capture-dock": <Camera className="h-5 w-5" />,
  "scan-station": <Barcode className="h-5 w-5" />,
  "qc-camera": <Eye className="h-5 w-5" />,
  "pos-reader": <CreditCard className="h-5 w-5" />,
  "content-kit": <Package className="h-5 w-5" />,
};

interface HardwareFeatureCardProps {
  feature: (typeof HARDWARE_FEATURES)[0];
  enabled: boolean;
  onEnable: (featureId: HardwareFeature) => void;
  onConfigure: (featureId: HardwareFeature) => void;
}

export function HardwareFeatureCard({
  feature,
  enabled,
  onEnable,
  onConfigure,
}: HardwareFeatureCardProps) {
  return (
    <Card className="relative overflow-hidden transition-all hover:border-border-strong">
      <div className="absolute inset-0 opacity-0 transition-opacity hover:opacity-100 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {featureIcons[feature.id as HardwareFeature]}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{feature.name}</CardTitle>
              <CardDescription className="text-xs mt-1">{feature.subtitle}</CardDescription>
            </div>
          </div>
          {enabled && <CheckCircle2 className="h-5 w-5 text-green-600 sticky top-4" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>

        <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Info className="h-3.5 w-3.5 text-primary" />
            Moat
          </div>
          <p className="text-xs text-muted-foreground pl-5">{feature.moat}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded border border-border p-2 bg-muted/30">
            <p className="text-muted-foreground font-medium">COGS</p>
            <p className="font-mono font-semibold">${feature.costOfGoodsUSD}</p>
          </div>
          <div className="rounded border border-border p-2 bg-muted/30">
            <p className="text-muted-foreground font-medium">Difficulty</p>
            <Badge variant="outline" className="mt-1 text-xs capitalize">
              {feature.difficulty}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {!enabled ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEnable(feature.id as HardwareFeature)}
              className="flex-1"
            >
              Enable
            </Button>
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={() => onConfigure(feature.id as HardwareFeature)}
              className="flex-1"
            >
              Configure
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export function HardwareOverview() {
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    "capture-dock": false,
    "scan-station": false,
    "qc-camera": false,
    "pos-reader": false,
    "content-kit": false,
  });

  const handleEnable = (featureId: HardwareFeature) => {
    setEnabledFeatures((prev) => ({
      ...prev,
      [featureId]: true,
    }));
  };

  const handleConfigure = (featureId: HardwareFeature) => {
    console.log(`Configure ${featureId}`);
    // Route to feature-specific configuration page
  };

  const enabledCount = Object.values(enabledFeatures).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-foreground">Hardware Systems Status</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {enabledCount} of {HARDWARE_FEATURES.length} hardware features enabled. Each feature
          generates proprietary data that strengthens your product data over time.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {HARDWARE_FEATURES.map((feature) => (
          <HardwareFeatureCard
            key={feature.id}
            feature={feature}
            enabled={enabledFeatures[feature.id]}
            onEnable={handleEnable}
            onConfigure={handleConfigure}
          />
        ))}
      </div>
    </div>
  );
}
