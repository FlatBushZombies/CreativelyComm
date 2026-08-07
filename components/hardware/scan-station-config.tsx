"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScanStation, ScanRecord } from "@/lib/hardware";
import { Barcode, Bluetooth, AlertCircle } from "lucide-react";

interface ScanStationConfigProps {
  onSave?: (config: ScanStation) => void;
  initialConfig?: ScanStation;
}

export function ScanStationConfig({ onSave, initialConfig }: ScanStationConfigProps) {
  const [config, setConfig] = useState<ScanStation>(
    initialConfig || {
      id: crypto.randomUUID(),
      name: "Primary Scan Station",
      enabled: false,
      bluetoothPaired: false,
      scannerType: "1D",
      printerConnected: false,
      autoMatchSKU: true,
      flagMissingFields: true,
      metaConversionsApiEnabled: false,
      restockAlertThreshold: 20,
      scanLog: [],
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
                <Barcode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Scan Station Setup</CardTitle>
                <CardDescription>
                  Configure your barcode scanner + receipt printer
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
              <Label htmlFor="station-name">Device Name</Label>
              <Input
                id="station-name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g., Intake Point A"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="scanner-type">Scanner Type</Label>
              <select
                id="scanner-type"
                value={config.scannerType}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    scannerType: (e.target.value as "1D" | "2D") || "1D",
                  })
                }
                className="w-full mt-2 px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="1D">1D Barcode (UPC/EAN)</option>
                <option value="2D">2D Barcode (QR/Data Matrix)</option>
              </select>
            </div>
          </div>

          {/* Bluetooth & Printer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Bluetooth className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Scanner</span>
              </div>
              <Badge variant={config.bluetoothPaired ? "default" : "secondary"}>
                {config.bluetoothPaired ? "Paired" : "Unpaired"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setConfig({ ...config, bluetoothPaired: !config.bluetoothPaired })}
              >
                {config.bluetoothPaired ? "Unpair" : "Pair Device"}
              </Button>
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <span className="font-semibold text-sm block">Printer</span>
              <Badge variant={config.printerConnected ? "default" : "secondary"}>
                {config.printerConnected ? "Connected" : "Not Connected"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setConfig({ ...config, printerConnected: !config.printerConnected })}
              >
                {config.printerConnected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>

          {/* Active Settings */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <Label className="text-sm font-medium">Enable Scan Station</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Auto-match SKUs and flag missing fields at intake
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {/* Automation Settings */}
          {config.enabled && (
            <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
              <h4 className="font-semibold text-sm">Automation</h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Auto-match SKU</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create SKU if it doesn't exist
                    </p>
                  </div>
                  <Switch
                    checked={config.autoMatchSKU}
                    onCheckedChange={(checked) => setConfig({ ...config, autoMatchSKU: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Flag Missing Fields</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Alert on incomplete product data
                    </p>
                  </div>
                  <Switch
                    checked={config.flagMissingFields}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, flagMissingFields: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Meta Conversions API</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fire "back in stock" events on restock scan
                    </p>
                  </div>
                  <Switch
                    checked={config.metaConversionsApiEnabled}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, metaConversionsApiEnabled: checked })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="restock-threshold" className="text-xs">
                  Restock Alert Threshold (%)
                </Label>
                <Input
                  id="restock-threshold"
                  type="number"
                  min="1"
                  max="100"
                  value={config.restockAlertThreshold}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      restockAlertThreshold: parseInt(e.target.value) || 20,
                    })
                  }
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Trigger alerts when inventory reaches this percentage
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 rounded bg-amber-500/5 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs">
                  Data Moat: System of record at point of physical handling — hard to rip out
                </span>
              </div>
            </div>
          )}

          {/* Scan History */}
          {config.scanLog.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm">Recent Scans</span>
                <Badge variant="outline">{config.scanLog.length} total</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Last scan: {config.lastScanTime?.toLocaleDateString() || "Never"}
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
