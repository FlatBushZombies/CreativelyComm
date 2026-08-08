"use client";

import { useRouter } from "next/navigation";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Barcode, Eye, CreditCard, Package, CheckCircle2 } from "lucide-react";
import { HARDWARE_FEATURES, type HardwareFeature, type HardwareSetting } from "@/lib/hardware-catalog";
import { setHardwareEnabledAction } from "@/app/(dashboard)/hardware/actions";
import { cn } from "@/lib/utils";
import { useTransition } from "react";

const featureIcons: Record<HardwareFeature, React.ReactNode> = {
  "capture-dock": <Camera className="h-5 w-5" />,
  "scan-station": <Barcode className="h-5 w-5" />,
  "qc-camera": <Eye className="h-5 w-5" />,
  "quick-sale": <CreditCard className="h-5 w-5" />,
  "content-kit": <Package className="h-5 w-5" />,
};

const featureTabs: Record<HardwareFeature, string> = {
  "capture-dock": "capture",
  "scan-station": "scan",
  "qc-camera": "qc",
  "quick-sale": "quick-sale",
  "content-kit": "content",
};

interface HardwareOverviewProps {
  settings: Record<HardwareFeature, HardwareSetting>;
  onSelectTab: (tab: string) => void;
}

/** Server-backed: `settings` comes from a real hardware_settings query, not client-only state. */
export function HardwareOverview({ settings, onSelectTab }: HardwareOverviewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const enabledCount = Object.values(settings).filter((s) => s.enabled).length;

  function handleEnable(featureId: HardwareFeature) {
    startTransition(async () => {
      await setHardwareEnabledAction(featureId, true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Hardware workflows</h3>
        <p className="text-sm text-muted-foreground">
          {enabledCount} of {HARDWARE_FEATURES.length} enabled. These use hardware you already
          own — your phone or webcam, a standard barcode scanner, any printer.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {HARDWARE_FEATURES.map((feature) => {
          const setting = settings[feature.id];
          return (
            <Card key={feature.id} className="relative overflow-hidden transition-all hover:border-border-strong">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        setting.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {featureIcons[feature.id]}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">{feature.subtitle}</CardDescription>
                    </div>
                  </div>
                  {setting.enabled && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                <div className="flex gap-2 pt-2">
                  {!setting.enabled ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnable(feature.id)}
                      disabled={isPending}
                      className="flex-1"
                    >
                      Enable
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onSelectTab(featureTabs[feature.id])}
                      className="flex-1"
                    >
                      Configure
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
