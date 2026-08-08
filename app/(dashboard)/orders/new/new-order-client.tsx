"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Minus, Trash2, ScanLine } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FadeIn } from "@/components/shared/fade-in";
import type { Product } from "@/lib/products";
import { createOrderAction } from "../actions";

interface NewOrderClientProps {
  products: Product[];
  source?: "manual" | "pos";
}

interface LineItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export function NewOrderClient({ products, source = "manual" }: NewOrderClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const [scanError, setScanError] = useState<string | undefined>();
  const scanInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    if (!search) return products.slice(0, 8);
    return products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 8);
  }, [products, search]);

  function addProduct(product: Product) {
    setLineItems((prev) => {
      const existing = prev.find((li) => li.productId === product.id);
      if (existing) {
        return prev.map((li) => (li.productId === product.id ? { ...li, quantity: li.quantity + 1 } : li));
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }

  function handleScan(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const value = scanValue.trim();
    if (!value) return;

    const match = products.find((p) => p.sku.toLowerCase() === value.toLowerCase());
    if (match) {
      addProduct(match);
      setScanError(undefined);
    } else {
      setScanError(`No product with SKU "${value}".`);
    }
    setScanValue("");
  }

  function updateQuantity(productId: string, delta: number) {
    setLineItems((prev) =>
      prev
        .map((li) => (li.productId === productId ? { ...li, quantity: li.quantity + delta } : li))
        .filter((li) => li.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setLineItems((prev) => prev.filter((li) => li.productId !== productId));
  }

  const total = lineItems.reduce((sum, li) => sum + li.price * li.quantity, 0);

  async function handleSubmit() {
    setError(undefined);
    if (lineItems.length === 0) {
      setError("Add at least one product to the order.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.set("items", JSON.stringify(lineItems.map((li) => ({ productId: li.productId, quantity: li.quantity }))));
    formData.set("customerName", customerName);
    formData.set("customerEmail", customerEmail);
    formData.set("paymentMethod", paymentMethod);
    formData.set("source", source);

    const result = await createOrderAction(formData);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push(`/orders/${result.orderId}`);
  }

  return (
    <>
      <DashboardHeader
        title={source === "pos" ? "Quick Sale" : "New Order"}
        description={
          source === "pos"
            ? "Scan items and record the sale — payment method is noted, not processed"
            : "Add products, then mark the sale as paid"
        }
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  ref={scanInputRef}
                  placeholder="Scan a barcode (or type a SKU and press Enter)"
                  className="pl-9 border-primary/30"
                  value={scanValue}
                  onChange={(e) => {
                    setScanValue(e.target.value);
                    setScanError(undefined);
                  }}
                  onKeyDown={handleScan}
                  autoFocus
                />
              </div>
              {scanError && <p className="mt-1.5 text-xs text-red-600">{scanError}</p>}

              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="mt-3 space-y-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/25 hover:bg-accent/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.trackInventory ? `${product.stockQuantity} in stock` : "Not tracked"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium">${product.price.toFixed(2)}</span>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No products found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineItems.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No items yet — add products from the left.</p>
                ) : (
                  <div className="space-y-2">
                    {lineItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, -1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.productId, 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="w-16 shrink-0 text-right text-sm font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(item.productId)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-4 text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer & payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Customer name (optional)</Label>
                  <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Customer email (optional)</Label>
                  <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Payment method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Leave open (no payment yet)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Creating..." : paymentMethod ? "Mark paid & create order" : "Create order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
