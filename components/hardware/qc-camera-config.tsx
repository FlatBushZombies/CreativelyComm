"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PackShipQCCamera, QCPhotoRecord } from "@/lib/hardware";
import { Eye, Shield, AlertCircle } from "lucide-react";

interface QCCameraConfigProps {
  onSave?: (config: PackShipQCCamera) => void;
  initialConfig?: PackShipQCCamera;
}

export function QCCameraConfig({ onSave, initialConfig }: QCCameraConfigProps) {
  const [config, setConfig] = useState<PackShipQCCamera>(
    initialConfig || {
      id: crypto.randomUUID(),
      name: "Pack Station QC",
      enabled: false,
      location: "packing-station",
      fixed: true,
      autoCapture: true,
      captureOnTrigger: false,
      verifyAgainstListing: true,
      timestampProof: true,
      anonymizeData: true,
      qcPhotos: [],
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
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>QC Camera Setup</CardTitle>
                <CardDescription>
                  Configure pack station verification camera
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
              <Label htmlFor="camera-name">Camera Name</Label>
              <Input
                id="camera-name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g., Pack Station A"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={config.location}
                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                placeholder="e.g., Packing Station"
                className="mt-2"
              />
            </div>
          </div>

          {/* Camera Type */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Fixed Mount</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Camera permanently installed at location
                </p>
              </div>
              <Switch
                checked={config.fixed}
                onCheckedChange={(checked) => setConfig({ ...config, fixed: checked })}
              />
            </div>
          </div>

          {/* Active Settings */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <Label className="text-sm font-medium">Enable QC Camera</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Photograph outgoing items pre-ship
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {/* Verification Settings */}
          {config.enabled && (
            <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
              <h4 className="font-semibold text-sm">Verification Settings</h4>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Auto-Capture on Scan</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically photograph when order is scanned
                    </p>
                  </div>
                  <Switch
                    checked={config.autoCapture}
                    onCheckedChange={(checked) => setConfig({ ...config, autoCapture: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Verify Against Listing</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Compare item to product listing visually
                    </p>
                  </div>
                  <Switch
                    checked={config.verifyAgainstListing}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, verifyAgainstListing: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Timestamp Proof</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Include timestamp for dispute defense
                    </p>
                  </div>
                  <Switch
                    checked={config.timestampProof}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, timestampProof: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded bg-muted/50">
                  <div>
                    <Label className="text-sm font-medium">Anonymize Data</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Remove PII from aggregate fulfillment signals
                    </p>
                  </div>
                  <Switch
                    checked={config.anonymizeData}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, anonymizeData: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded bg-blue-500/5 border border-blue-500/20">
                <Shield className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs">
                  Trust Layer: Verified fulfillment signal becomes a badge in dynamic ads — high
                  switching cost
                </span>
              </div>
            </div>
          )}

          {/* QC Stats */}
          {config.qcPhotos.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Verification History</span>
                <Badge variant="outline">{config.qcPhotos.length} items verified</Badge>
              </div>
              {config.verifiedFulfillmentScore !== undefined && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Verified Fulfillment Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${config.verifiedFulfillmentScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold">
                      {config.verifiedFulfillmentScore}%
                    </span>
                  </div>
                </div>
              )}
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
