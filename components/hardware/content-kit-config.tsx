"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { requestContentKitAction } from "@/app/(dashboard)/hardware/actions";
import type { ContentKitRequest } from "@/lib/hardware";

interface ContentKitConfigProps {
  requests: ContentKitRequest[];
}

const statusVariant: Record<ContentKitRequest["status"], "warning" | "secondary" | "success"> = {
  requested: "warning",
  shipped: "secondary",
  delivered: "success",
};

export function ContentKitConfig({ requests }: ContentKitConfigProps) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!shippingAddress.trim()) {
      setError("Enter a shipping address.");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.set("shippingAddress", shippingAddress.trim());

    startTransition(async () => {
      const result = await requestContentKitAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setShippingAddress("");
      setSubmitted(true);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Content Kit</CardTitle>
              <CardDescription>Ring light + backdrop + phone mount</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div>
              <Label htmlFor="shipping-address">Shipping address</Label>
              <Textarea
                id="shipping-address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Where should we send it?"
                className="mt-2"
                rows={3}
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            {submitted && !error && (
              <p className="text-xs text-green-600">Request submitted — check its status below.</p>
            )}
            <Button onClick={handleSubmit} disabled={isPending} className="w-full">
              {isPending ? "Submitting..." : "Request a Content Kit"}
            </Button>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm">Your requests</span>
              <Badge variant="outline">{requests.length}</Badge>
            </div>
            {requests.length === 0 ? (
              <p className="text-xs text-muted-foreground">No requests yet.</p>
            ) : (
              <div className="space-y-2">
                {requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-muted-foreground">
                      {new Date(request.requestedAt).toLocaleDateString()} · {request.shippingAddress}
                    </span>
                    <Badge variant={statusVariant[request.status]} className="capitalize shrink-0">
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
