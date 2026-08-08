"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CameraCapture } from "@/components/hardware/camera-capture";
import { Camera, Check, Loader2 } from "lucide-react";
import {
  setHardwareEnabledAction,
  saveHardwareConfigAction,
  uploadCaptureShotAction,
  attachCaptureShotsAction,
} from "@/app/(dashboard)/hardware/actions";

interface CaptureDockConfigProps {
  enabled: boolean;
  config: { angleCount?: number; ringLightIntensity?: number };
  products: { id: string; name: string }[];
}

interface CapturedShot {
  imageUrl: string;
  angle: number;
}

export function CaptureDockConfig({ enabled: initialEnabled, config, products }: CaptureDockConfigProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [angleCount, setAngleCount] = useState(config.angleCount ?? 8);
  const [ringLightIntensity, setRingLightIntensity] = useState(config.ringLightIntensity ?? 60);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [shots, setShots] = useState<CapturedShot[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [attached, setAttached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEnabledChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      await setHardwareEnabledAction("capture-dock", next);
    });
  }

  function saveSettings(nextAngleCount = angleCount, nextRingLight = ringLightIntensity) {
    startTransition(async () => {
      await saveHardwareConfigAction("capture-dock", {
        angleCount: nextAngleCount,
        ringLightIntensity: nextRingLight,
      });
    });
  }

  function handleCapture(blob: Blob) {
    const angle = Math.round((shots.length * 360) / angleCount);
    const formData = new FormData();
    formData.append("photo", blob, `shot-${shots.length}.jpg`);
    formData.set("sessionId", sessionId);
    formData.set("angle", String(angle));

    startTransition(async () => {
      const result = await uploadCaptureShotAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.imageUrl) {
        setShots((prev) => [...prev, { imageUrl: result.imageUrl!, angle }]);
        setError(null);
      }
    });
  }

  function handleAttach() {
    if (!selectedProductId || shots.length === 0) return;
    startTransition(async () => {
      const result = await attachCaptureShotsAction(
        selectedProductId,
        shots.map((s) => s.imageUrl)
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setAttached(true);
    });
  }

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
                <CardTitle>Multi-Angle Capture</CardTitle>
                <CardDescription>Guided photo session using your device camera</CardDescription>
              </div>
            </div>
            <Badge variant={enabled ? "default" : "outline"}>{enabled ? "Active" : "Inactive"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <Label className="text-sm font-medium">Enable Multi-Angle Capture</Label>
              <p className="text-xs text-muted-foreground mt-1">Turns on the guided capture session below</p>
            </div>
            <Switch checked={enabled} onCheckedChange={handleEnabledChange} />
          </div>

          {enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="angle-count" className="text-xs">
                    Number of angles
                  </Label>
                  <Input
                    id="angle-count"
                    type="number"
                    min={2}
                    max={24}
                    value={angleCount}
                    onChange={(e) => setAngleCount(parseInt(e.target.value) || 8)}
                    onBlur={() => saveSettings()}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="ring-light" className="text-xs">
                    Screen fill-light intensity
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      id="ring-light"
                      type="range"
                      min={0}
                      max={100}
                      value={ringLightIntensity}
                      onChange={(e) => setRingLightIntensity(parseInt(e.target.value))}
                      onMouseUp={() => saveSettings()}
                      onTouchEnd={() => saveSettings()}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-8">{ringLightIntensity}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Capture session</h4>
                  <Badge variant="outline">
                    {shots.length} / {angleCount} shots
                  </Badge>
                </div>
                <CameraCapture
                  onCapture={handleCapture}
                  flashIntensity={ringLightIntensity}
                  captureLabel={`Capture shot ${shots.length + 1}`}
                  disabled={isPending || shots.length >= angleCount}
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                {shots.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {shots.map((shot, i) => (
                      <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                        <Image src={shot.imageUrl} alt={`Angle ${shot.angle}°`} fill sizes="64px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {shots.length > 0 && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
                  <h4 className="font-semibold text-sm">Attach to a product</h4>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={!selectedProductId || isPending || attached}
                    onClick={handleAttach}
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : attached ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : null}
                    {attached ? "Added to product" : `Add ${shots.length} photo${shots.length === 1 ? "" : "s"} to product`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
