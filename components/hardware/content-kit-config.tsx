"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ContentKit, ContentKitMetrics } from "@/lib/hardware";
import { Package, TrendingUp, AlertCircle } from "lucide-react";

interface ContentKitConfigProps {
  onSave?: (config: ContentKit) => void;
  initialConfig?: ContentKit;
}

export function ContentKitConfig({ onSave, initialConfig }: ContentKitConfigProps) {
  const [config, setConfig] = useState<ContentKit>(
    initialConfig || {
      id: crypto.randomUUID(),
      name: "Loss-Leader Content Kit",
      enabled: false,
      variantSku: "CK-001",
      costOfGoodsUSD: 20,
      shippingCostUSD: 5,
      freeShipToNewSignups: true,
      onboardingActivationTracker: true,
      kitsShipped: [],
    }
  );

  const handleSave = () => {
    onSave?.(config);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Content Kit Setup</CardTitle>
                <CardDescription>
                  Ring light + backdrop + phone mount onboarding incentive
                </CardDescription>
              </div>
            </div>
            <Badge variant={config.enabled ? "default" : "outline"}>
              {config.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kit Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="kit-sku">SKU</Label>
              <Input
                id="kit-sku"
                value={config.variantSku}
                onChange={(e) => setConfig({ ...config, variantSku: e.target.value })}
                placeholder="e.g., CK-001"
                className="mt-2 font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kit-cogs" className="text-xs">
                  COGS
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="kit-cogs"
                    type="number"
                    min="0"
                    step="0.5"
                    value={config.costOfGoodsUSD}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        costOfGoodsUSD: parseFloat(e.target.value) || 20,
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shipping-cost" className="text-xs">
                  Shipping Cost
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    id="shipping-cost"
                    type="number"
                    min="0"
                    step="0.5"
                    value={config.shippingCostUSD}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        shippingCostUSD: parseFloat(e.target.value) || 5,
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-xs text-blue-900">
                <strong>Total Cost:</strong> ${(config.costOfGoodsUSD + config.shippingCostUSD).toFixed(2)} per
                kit
              </p>
            </div>
          </div>

          {/* Distribution Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
              <div>
                <Label className="text-sm font-medium">Enable Kit Distribution</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Ship to new paid signups automatically
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
              />
            </div>

            {config.enabled && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Free Shipping</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Don't charge new customers for delivery
                    </p>
                  </div>
                  <Switch
                    checked={config.freeShipToNewSignups}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, freeShipToNewSignups: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Track Activation</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor unbox and first upload rates
                    </p>
                  </div>
                  <Switch
                    checked={config.onboardingActivationTracker}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, onboardingActivationTracker: checked })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Metrics */}
          {config.activationMetrics && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">Activation Metrics</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Unbox Rate</span>
                    <span className="font-mono font-semibold">
                      {config.activationMetrics.unboxRate}%
                    </span>
                  </div>
                  <Progress value={config.activationMetrics.unboxRate} className="h-1.5" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Photo Upload Rate</span>
                    <span className="font-mono font-semibold">
                      {config.activationMetrics.photoUploadRate}%
                    </span>
                  </div>
                  <Progress value={config.activationMetrics.photoUploadRate} className="h-1.5" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Activation Rate</span>
                    <span className="font-mono font-semibold">
                      {config.activationMetrics.activationRate}%
                    </span>
                  </div>
                  <Progress value={config.activationMetrics.activationRate} className="h-1.5" />
                </div>

                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <strong>Cost Per Activation:</strong>{" "}
                    <span className="font-mono font-semibold">
                      ${config.activationMetrics.cpl.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {config.kitsShipped.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Distribution History</span>
                <Badge variant="outline">{config.kitsShipped.length} shipped</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last shipment: {config.lastDistributionDate?.toLocaleDateString() || "Never"}
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 rounded bg-amber-500/5 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs">
              Weakest moat, but cheapest & fastest to test. Runs as a real Meta ad test to gauge
              hardware appetite.
            </span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
