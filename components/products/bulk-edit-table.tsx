"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Product, ProductStatus, BulkProductUpdate } from "@/lib/products";
import { bulkUpdateProductsAction } from "@/app/(dashboard)/products/actions";

const statusOptions: ProductStatus[] = ["draft", "pending", "optimized", "published"];

// Local editing shape: tags are edited as a raw comma-separated string so
// typing a trailing comma doesn't get reformatted mid-keystroke -- only
// parsed into an array (matching BulkProductUpdate.tags) at save time.
interface Row {
  id: string;
  name: string;
  price: number;
  category: string;
  status: ProductStatus;
  sku: string;
  description: string;
  tagsText: string;
}

function toRow(product: Product): Row {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    status: product.status,
    sku: product.sku,
    description: product.description,
    tagsText: product.tags.join(", "),
  };
}

function toBulkUpdate(row: Row): BulkProductUpdate {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    status: row.status,
    sku: row.sku,
    description: row.description,
    tags: row.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

export function BulkEditTable({ products }: { products: Product[] }) {
  const [rows, setRows] = useState<Record<string, Row>>(() =>
    Object.fromEntries(products.map((p) => [p.id, toRow(p)]))
  );
  const [error, setError] = useState<string | undefined>();
  const [savedCount, setSavedCount] = useState<number | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const originalById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, toRow(p)])),
    [products]
  );

  const dirtyRows = Object.values(rows).filter((row) => {
    const original = originalById[row.id];
    return (
      original &&
      (row.name !== original.name ||
        row.price !== original.price ||
        row.category !== original.category ||
        row.status !== original.status ||
        row.sku !== original.sku ||
        row.description !== original.description ||
        row.tagsText !== original.tagsText)
    );
  });

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setSavedCount(undefined);
  }

  function handleSave() {
    setError(undefined);
    startTransition(async () => {
      const result = await bulkUpdateProductsAction(dirtyRows.map(toBulkUpdate));
      if (result.error) {
        setError(result.error);
        return;
      }
      setSavedCount(result.updated);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {dirtyRows.length > 0
            ? `${dirtyRows.length} unsaved change${dirtyRows.length === 1 ? "" : "s"}`
            : savedCount !== undefined
              ? `Saved ${savedCount} product${savedCount === 1 ? "" : "s"}`
              : "Edit fields directly, then save"}
        </p>
        <Button size="sm" onClick={handleSave} disabled={dirtyRows.length === 0 || isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">SKU</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Description</th>
              <th className="p-3 font-medium">Tags</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const row = rows[product.id];
              return (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="p-2">
                    <Input
                      value={row.name}
                      onChange={(e) => updateRow(product.id, { name: e.target.value })}
                      className="h-9 min-w-36"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={row.sku}
                      onChange={(e) => updateRow(product.id, { sku: e.target.value })}
                      className="h-9 w-28"
                      placeholder="SKU"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.price}
                      onChange={(e) => updateRow(product.id, { price: Number(e.target.value) || 0 })}
                      className="h-9 w-28"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={row.category}
                      onChange={(e) => updateRow(product.id, { category: e.target.value })}
                      className="h-9 min-w-32"
                    />
                  </td>
                  <td className="p-2">
                    <Textarea
                      value={row.description}
                      onChange={(e) => updateRow(product.id, { description: e.target.value })}
                      className="min-h-9 w-56 resize-y py-1.5 text-sm"
                      rows={1}
                      placeholder="Description"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={row.tagsText}
                      onChange={(e) => updateRow(product.id, { tagsText: e.target.value })}
                      className="h-9 min-w-40"
                      placeholder="tag-one, tag-two"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={row.status}
                      onChange={(e) => updateRow(product.id, { status: e.target.value as ProductStatus })}
                      className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
