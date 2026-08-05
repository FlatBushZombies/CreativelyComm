"use client";

import { Printer } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/shared/fade-in";
import type { Order, OrderStatus } from "@/lib/orders";
import { updateOrderStatusAction } from "../actions";

const statusVariant: Record<OrderStatus, "secondary" | "success" | "warning" | "muted"> = {
  open: "warning",
  paid: "success",
  fulfilled: "secondary",
  cancelled: "muted",
  refunded: "muted",
};

const ALLOWED_ACTIONS: Record<OrderStatus, { status: OrderStatus; label: string }[]> = {
  open: [
    { status: "paid", label: "Mark Paid" },
    { status: "cancelled", label: "Cancel" },
  ],
  paid: [
    { status: "fulfilled", label: "Mark Fulfilled" },
    { status: "cancelled", label: "Cancel" },
  ],
  fulfilled: [],
  cancelled: [],
  refunded: [],
};

export function OrderDetailClient({ order, storeName }: { order: Order; storeName: string }) {
  const actions = ALLOWED_ACTIONS[order.status];

  return (
    <>
      <div className="print:hidden">
        <DashboardHeader title={`Order #${order.id.slice(0, 8)}`} description={new Date(order.createdAt).toLocaleString()} />
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl">
        <FadeIn className="space-y-6 print:hidden">
          <div className="flex items-center justify-between">
            <Badge variant={statusVariant[order.status]} className="capitalize text-sm">
              {order.status}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                Print receipt
              </Button>
              {actions.map((action) => (
                <form key={action.status} action={updateOrderStatusAction}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="status" value={action.status} />
                  <Button type="submit" variant={action.status === "cancelled" ? "outline" : "default"}>
                    {action.label}
                  </Button>
                </form>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              {(order.customerName || order.customerEmail) && (
                <div className="mb-4 text-sm">
                  {order.customerName && <p className="font-medium">{order.customerName}</p>}
                  {order.customerEmail && <p className="text-muted-foreground">{order.customerEmail}</p>}
                </div>
              )}

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p>{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-medium">${item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>

              {order.paymentMethod && (
                <p className="mt-4 text-xs text-muted-foreground capitalize">Paid via {order.paymentMethod}</p>
              )}
              {order.note && <p className="mt-2 text-sm text-muted-foreground">{order.note}</p>}
            </CardContent>
          </Card>
        </FadeIn>

        <div className="hidden print:block font-mono text-sm">
          <p className="text-center text-base font-semibold">{storeName}</p>
          <p className="text-center text-xs">
            Order #{order.id.slice(0, 8)} · {new Date(order.createdAt).toLocaleString()}
          </p>
          {(order.customerName || order.customerEmail) && (
            <p className="mt-2 text-center text-xs">
              {order.customerName}
              {order.customerName && order.customerEmail ? " · " : ""}
              {order.customerEmail}
            </p>
          )}
          <div className="mt-4 border-t border-dashed border-black pt-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.quantity}x {item.productName}
                </span>
                <span>${item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-dashed border-black pt-2 font-semibold">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          {order.paymentMethod && <p className="mt-2 text-xs capitalize">Paid via {order.paymentMethod}</p>}
          <p className="mt-4 text-center text-xs">Thank you!</p>
        </div>
      </div>
    </>
  );
}
