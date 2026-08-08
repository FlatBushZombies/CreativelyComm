"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CameraCapture } from "@/components/hardware/camera-capture";
import { Eye, Check } from "lucide-react";
import { setHardwareEnabledAction, uploadQCPhotoAction } from "@/app/(dashboard)/hardware/actions";
import type { QCPhoto } from "@/lib/hardware";

interface QCCameraConfigProps {
  enabled: boolean;
  openOrders: { id: string; label: string }[];
  recentPhotos: QCPhoto[];
}

export function QCCameraConfig({ enabled: initialEnabled, openOrders, recentPhotos }: QCCameraConfigProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedForOrder, setSavedForOrder] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEnabledChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      await setHardwareEnabledAction("qc-camera", next);
    });
  }

  function handleCapture(blob: Blob) {
    if (!selectedOrderId) {
      setError("Select an order first.");
      return;
    }
    const formData = new FormData();
    formData.append("photo", blob, "qc-photo.jpg");
    formData.set("orderId", selectedOrderId);

    startTransition(async () => {
      const result = await uploadQCPhotoAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setSavedForOrder(selectedOrderId);
    });
  }

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
                <CardTitle>Pack Verification</CardTitle>
                <CardDescription>Photograph orders before they ship</CardDescription>
              </div>
            </div>
            <Badge variant={enabled ? "default" : "outline"}>{enabled ? "Active" : "Inactive"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <Label className="text-sm font-medium">Enable Pack Verification</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Attach a timestamped photo to an order before it ships
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={handleEnabledChange} />
          </div>

          {enabled && (
            <>
              <div>
                <Label className="text-xs">Order</Label>
                <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={openOrders.length === 0 ? "No open orders" : "Choose an order"} />
                  </SelectTrigger>
                  <SelectContent>
                    {openOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
                <CameraCapture onCapture={handleCapture} captureLabel="Capture verification photo" disabled={isPending} />
                {error && <p className="text-xs text-red-600">{error}</p>}
                {savedForOrder && !error && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600">
                    <Check className="h-3.5 w-3.5" />
                    Photo saved to order #{savedForOrder.slice(0, 8)}
                  </p>
                )}
              </div>

              {recentPhotos.length > 0 && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Recent verification photos</span>
                    <Badge variant="outline">{recentPhotos.length}</Badge>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {recentPhotos.slice(0, 8).map((photo) => (
                      <div key={photo.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                        <Image src={photo.imageUrl} alt="Pack verification" fill sizes="64px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
