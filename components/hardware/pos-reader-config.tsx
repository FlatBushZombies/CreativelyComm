"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CountertopPOSReader, OnlineSaleRecord } from "@/lib/hardware";
import { CreditCard, Zap, AlertCircle } from "lucide-react";

interface POSReaderConfigProps {
  onSave?: (config: CountertopPOSReader) => void;
  initialConfig?: CountertopPOSReader;
}

export function POSReaderConfig({ onSave, initialConfig }: POSReaderConfigProps) {
  const [config, setConfig] = useState<CountertopPOSReader>(
    initialConfig || {
      id: crypto.randomUUID(),
      name: "Countertop POS Reader",
      enabled: false,
      cardReaderConnected: false,
      paymentProcessor: "stripe",
      omniChannelSyncEnabled: false,
      instantInventorySync: false,
      buyerRetargetingEnabled: false,
      transactions: [],
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
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Countertop POS Reader</CardTitle>
                <CardDescription>
                  Configure card reader for in-person sales
                </CardDescription>
              </div>
            </div>
            <Badge variant={config.enabled ? "default" : "outline"}>
              {config.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="reader-name">Device Name</Label>
              <Input
                id="reader-name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g., Market Booth POS"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="payment-processor">Payment Processor</Label>
              <select
                id="payment-processor"
                value={config.paymentProcessor}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    paymentProcessor: (e.target.value as "stripe" | "square" | "paypal") || "stripe",
                  })
                }
                className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="stripe">Stripe</option>
                <option value="square">Square</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>

          {/* Connection Status */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Card Reader</span>
              </div>
              <Badge variant={config.cardReaderConnected ? "default" : "secondary"}>
                {config.cardReaderConnected ? "Connected" : "Not Connected"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => setConfig({ ...config, cardReaderConnected: !config.cardReaderConnected })}
            >
              {config.cardReaderConnected ? "Disconnect Reader" : "Connect Reader"}
            </Button>
          </div>

          {/* Active Settings */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <Label className="text-sm font-medium">Enable POS Reader</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Start accepting in-person card payments
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {/* Integration Settings */}
          {config.enabled && (
            <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
              <h4 className="font-semibold text-sm">Omni-Channel Integration</h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Sync Inventory</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Instantly sync sales across all channels
                    </p>
                  </div>
                  <Switch
                    checked={config.omniChannelSyncEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, omniChannelSyncEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Instant Sync</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real-time inventory updates (vs. batch)
                    </p>
                  </div>
                  <Switch
                    checked={config.instantInventorySync}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, instantInventorySync: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Buyer Retargeting</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add in-person buyers to Meta Custom Audience
                    </p>
                  </div>
                  <Switch
                    checked={config.buyerRetargetingEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, buyerRetargetingEnabled: checked })
                    }
                  />
                </div>
              </div>

              {config.buyerRetargetingEnabled && (
                <div>
                  <Label htmlFor="meta-audience" className="text-xs">
                    Meta Custom Audience ID
                  </Label>
                  <Input
                    id="meta-audience"
                    value={config.metaCustomAudienceId || ""}
                    onChange={(e) => setConfig({ ...config, metaCustomAudienceId: e.target.value })}
                    placeholder="Paste your Meta Audience ID"
                    className="mt-2 font-mono text-xs"
                  />
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded bg-amber-500/5 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs">
                  Data Moat: Payments + omni-channel inventory is one of the strongest lock-ins in
                  commerce
                </span>
              </div>
            </div>
          )}

          {/* Transaction Stats */}
          {config.transactions.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Transaction History</span>
                <Badge variant="outline">{config.transactions.length} sales</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Last sale: {config.lastTransactionTime?.toLocaleDateString() || "Never"}
              </p>
            </div>
          )}

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
