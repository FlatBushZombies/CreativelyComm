"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowRight } from "lucide-react";
import { setHardwareEnabledAction } from "@/app/(dashboard)/hardware/actions";
import type { Order } from "@/lib/orders";

interface QuickSaleProps {
  enabled: boolean;
  recentSales: Order[];
}

/**
 * Quick Sale is a real, barcode-first entry point into the existing order
 * flow (app/(dashboard)/orders/new) -- not a separate checkout UI. Live
 * card processing would require a certified physical reader plus a
 * Stripe/Square Terminal merchant account, neither of which exist here, so
 * payment method is recorded (cash/card/other), never processed -- same
 * behavior as a regular manual order.
 */
export function QuickSale({ enabled: initialEnabled, recentSales }: QuickSaleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  function handleEnabledChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      await setHardwareEnabledAction("quick-sale", next);
    });
  }

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
                <CardTitle>Quick Sale</CardTitle>
                <CardDescription>Fast, barcode-first in-person checkout</CardDescription>
              </div>
            </div>
            <Badge variant={enabled ? "default" : "outline"}>{enabled ? "Active" : "Inactive"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <Label className="text-sm font-medium">Enable Quick Sale</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Surface a fast checkout for standing at a table or counter
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={handleEnabledChange} disabled={isPending} />
          </div>

          {enabled && (
            <>
              <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  Scan items to build an order and record the sale on the spot — the same order
                  flow as New Order, with the barcode field focused by default. Payment method is
                  recorded (cash, card, other), not processed; connecting a real card reader would
                  require a certified terminal and a payment processor account, which isn&apos;t
                  set up here.
                </p>
                <Button asChild className="w-full">
                  <Link href="/orders/new?source=pos">
                    Start a sale
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">Recent Quick Sales</span>
                  <Badge variant="outline">{recentSales.length}</Badge>
                </div>
                {recentSales.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No sales recorded through Quick Sale yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentSales.slice(0, 8).map((sale) => (
                      <Link
                        key={sale.id}
                        href={`/orders/${sale.id}`}
                        className="flex items-center justify-between text-xs hover:text-primary"
                      >
                        <span className="text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleDateString()}
                          {sale.customerName ? ` · ${sale.customerName}` : ""}
                        </span>
                        <span className="font-medium">${sale.total.toFixed(2)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
