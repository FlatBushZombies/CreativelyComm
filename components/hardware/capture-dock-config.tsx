"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CaptureDock, CaptureMetadata } from "@/lib/hardware";
import { Camera, Bluetooth, RotateCw } from "lucide-react";

interface CaptureDockConfigProps {
  onSave?: (config: CaptureDock) => void;
  initialConfig?: CaptureDock;
}

export function CaptureDockConfig({ onSave, initialConfig }: CaptureDockConfigProps) {
  const [config, setConfig] = useState<CaptureDock>(
    initialConfig || {
      id: crypto.randomUUID(),
      name: "Primary Capture Dock",
      enabled: false,
      bluetoothPaired: false,
      angleCount: 8,
      ringLightIntensity: 75,
      turntableRotationStep: 45,
      autoFireDelay: 2000,
      capturedMetadata: [],
    }
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

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
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Capture Dock Setup</CardTitle>
                <CardDescription>
                  Configure your turntable + ring light photo booth
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
              <Label htmlFor="dock-name">Device Name</Label>
              <Input
                id="dock-name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="e.g., Studio Dock A"
                className="mt-2"
              />
            </div>

            {config.serialNumber && (
              <div>
                <Label htmlFor="dock-serial">Serial Number</Label>
                <Input
                  id="dock-serial"
                  value={config.serialNumber}
                  disabled
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {/* Bluetooth Pairing */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bluetooth className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Bluetooth Connection</span>
              </div>
              <Badge variant={config.bluetoothPaired ? "default" : "secondary"}>
                {config.bluetoothPaired ? "Paired" : "Unpaired"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setConfig({ ...config, bluetoothPaired: !config.bluetoothPaired })}
            >
              {config.bluetoothPaired ? "Unpair Device" : "Scan & Pair"}
            </Button>
          </div>

          {/* Active Settings */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <Label className="text-sm font-medium">Enable Capture Dock</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Start capturing multi-angle product photos
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {/* Capture Configuration */}
          {config.enabled && (
            <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
              <h4 className="font-semibold text-sm">Capture Settings</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="angle-count" className="text-xs">
                    Number of Angles
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="angle-count"
                      type="number"
                      min="4"
                      max="32"
                      step="4"
                      value={config.angleCount}
                      onChange={(e) =>
                        setConfig({ ...config, angleCount: parseInt(e.target.value) || 8 })
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground font-mono">shots</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fire-delay" className="text-xs">
                    Time Between Shots
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="fire-delay"
                      type="number"
                      min="500"
                      max="5000"
                      step="500"
                      value={config.autoFireDelay}
                      onChange={(e) =>
                        setConfig({ ...config, autoFireDelay: parseInt(e.target.value) || 2000 })
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground font-mono">ms</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="light-intensity" className="text-xs">
                    Ring Light Intensity
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="light-intensity"
                      type="range"
                      min="0"
                      max="100"
                      value={config.ringLightIntensity}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ringLightIntensity: parseInt(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground font-mono w-8">
                      {config.ringLightIntensity}%
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="rotation-step" className="text-xs">
                    Rotation Step
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="rotation-step"
                      type="number"
                      min="5"
                      max="90"
                      step="5"
                      value={config.turntableRotationStep}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          turntableRotationStep: parseInt(e.target.value) || 45,
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground font-mono">deg</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-primary/5 border border-primary/20">
                <span className="text-xs font-medium">
                  Data Moat: Proprietary capture metadata (angle, lighting) compounds your
                  bg-removal model
                </span>
              </div>
            </div>
          )}

          {/* Captured Photos Stats */}
          {config.capturedMetadata.length > 0 && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm">Capture History</span>
                <Badge variant="outline">{config.capturedMetadata.length} photos</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Last session: {config.lastCaptureSession?.toLocaleDateString() || "Never"}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Configuration
            </Button>
            <Button variant="outline" size="icon">
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
