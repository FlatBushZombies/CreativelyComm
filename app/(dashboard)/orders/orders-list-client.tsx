"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import type { Order, OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";

const filters: (OrderStatus | "All")[] = ["All", "open", "paid", "fulfilled", "cancelled", "refunded"];

const statusVariant: Record<OrderStatus, "secondary" | "success" | "warning" | "muted"> = {
  open: "warning",
  paid: "success",
  fulfilled: "secondary",
  cancelled: "muted",
  refunded: "muted",
};

interface OrdersListClientProps {
  orders: Order[];
  isVendorScoped: boolean;
}

export function OrdersListClient({ orders, isVendorScoped }: OrdersListClientProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "All">("All");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        (order.customerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "All" || order.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [orders, search, activeFilter]);

  return (
    <>
      <DashboardHeader
        title="Orders"
        description={
          isVendorScoped
            ? `${orders.length} orders for your products`
            : `${orders.length} orders across your marketplace`
        }
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by customer or order id..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button asChild>
              <Link href="/orders/new">
                <Plus className="h-4 w-4" />
                New order
              </Link>
            </Button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </FadeIn>

        {filteredOrders.length === 0 ? (
          <FadeIn className="mt-12 text-center">
            <p className="text-muted-foreground">
              {orders.length === 0
                ? "No orders yet. Create one to record a sale."
                : "No orders match your search."}
            </p>
          </FadeIn>
        ) : (
          <StaggerContainer className="mt-6 space-y-3">
            {filteredOrders.map((order) => (
              <StaggerItem key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/25"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      Order #{order.id.slice(0, 8)}
                      {order.customerName && <span className="text-muted-foreground"> — {order.customerName}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">${order.total.toFixed(2)}</span>
                    {order.source === "pos" && (
                      <Badge variant="outline" className="text-xs">
                        Quick Sale
                      </Badge>
                    )}
                    <Badge variant={statusVariant[order.status]} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </>
  );
}
