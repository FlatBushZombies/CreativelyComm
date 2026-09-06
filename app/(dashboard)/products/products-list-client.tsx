"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderKanban, LayoutGrid, Search, SlidersHorizontal, Table2, X } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { ProductCard } from "@/components/products/product-card";
import { FolderCard } from "@/components/products/folder-card";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { ImportProductsDialog } from "@/components/products/import-products-dialog";
import { BulkEditTable } from "@/components/products/bulk-edit-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { bulkUpdateProductsAction } from "@/app/(dashboard)/products/actions";
import { groupProductsIntoFolders, UNCATEGORIZED_KEY } from "@/lib/folder-utils";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const filters = ["All", "Optimized", "Pending", "Draft", "Published"];

type ViewMode = "folders" | "grid" | "table";

interface ProductsListClientProps {
  products: Product[];
  /** Seeds the view mode from a `?view=` deep link (e.g. a "Fix now" blocker link). */
  initialView?: ViewMode;
  /** Seeds the active folder from a `?folder=` deep link. */
  initialFolder?: string;
  /** Seeds an explicit product-id filter from a `?ids=` deep link (small affected sets only). */
  initialProductIds?: string[];
}

export function ProductsListClient({
  products,
  initialView,
  initialFolder,
  initialProductIds,
}: ProductsListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [view, setView] = useState<ViewMode>(
    initialView ?? (initialFolder || initialProductIds ? "grid" : products.length > 0 ? "folders" : "grid")
  );
  const [activeFolder, setActiveFolder] = useState<string | null>(initialFolder ?? null);
  const [productIdFilter, setProductIdFilter] = useState<Set<string> | null>(
    initialProductIds && initialProductIds.length > 0 ? new Set(initialProductIds) : null
  );

  const folders = useMemo(() => groupProductsIntoFolders(products), [products]);
  const filteredFolders = useMemo(() => {
    if (!search) return folders;
    const q = search.toLowerCase();
    return folders.filter((f) => f.name.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)));
  }, [folders, search]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter =
        activeFilter === "All" ||
        product.status === activeFilter.toLowerCase();

      const matchesFolder =
        !activeFolder || (product.category.trim() || UNCATEGORIZED_KEY) === activeFolder;

      const matchesIdFilter = !productIdFilter || productIdFilter.has(product.id);

      return matchesSearch && matchesFilter && matchesFolder && matchesIdFilter;
    });
  }, [products, search, activeFilter, activeFolder, productIdFilter]);

  function openFolder(key: string) {
    setActiveFolder(key);
    setView("grid");
  }

  function backToFolders() {
    setActiveFolder(null);
    setProductIdFilter(null);
    setView("folders");
  }

  async function renameFolder(oldKey: string, nextName: string) {
    const affected = products.filter((p) => (p.category.trim() || UNCATEGORIZED_KEY) === oldKey);
    if (affected.length === 0) return;

    await bulkUpdateProductsAction(
      affected.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: nextName,
        status: p.status,
        sku: p.sku,
        description: p.description,
        tags: p.tags,
      }))
    );

    if (activeFolder === oldKey) setActiveFolder(nextName);
    router.refresh();
  }

  return (
    <>
      <DashboardHeader
        title="Product Library"
        description={`${products.length} products in your library`}
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products, categories, tags..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex rounded-lg border border-border p-0.5">
                <button
                  onClick={backToFolders}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    view === "folders" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                  aria-label="Folder view"
                >
                  <FolderKanban className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    view === "grid" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("table")}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    view === "table" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )}
                  aria-label="Table view (bulk edit)"
                >
                  <Table2 className="h-4 w-4" />
                </button>
              </div>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <ImportProductsDialog />
              <AddProductDialog />
            </div>
          </div>

          {view !== "folders" && (
            <div className="mt-4 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
              {activeFolder && (
                <button
                  onClick={backToFolders}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {activeFolder}
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              {productIdFilter && (
                <button
                  onClick={() => setProductIdFilter(null)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {productIdFilter.size} linked product{productIdFilter.size === 1 ? "" : "s"}
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    activeFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </FadeIn>

        {view === "folders" ? (
          products.length === 0 ? (
            <FadeIn className="mt-12 text-center">
              <p className="text-muted-foreground">No products yet. Add your first product to get started.</p>
            </FadeIn>
          ) : (
            <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFolders.map((folder) => (
                <StaggerItem key={folder.key}>
                  <FolderCard
                    folder={folder}
                    onOpen={() => openFolder(folder.key)}
                    onRename={(nextName) => renameFolder(folder.key, nextName)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )
        ) : filteredProducts.length === 0 ? (
          <FadeIn className="mt-12 text-center">
            <p className="text-muted-foreground">
              {products.length === 0
                ? "No products yet. Add your first product to get started."
                : "No products match your search."}
            </p>
          </FadeIn>
        ) : view === "grid" ? (
          <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="mt-6">
            <BulkEditTable products={filteredProducts} />
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {view === "folders"
              ? `${filteredFolders.length} folder${filteredFolders.length === 1 ? "" : "s"}`
              : `Showing ${filteredProducts.length} of ${products.length} products`}
          </span>
          <Badge variant="secondary">{products.filter((p) => p.status === "optimized").length} optimized</Badge>
        </div>
      </div>
    </>
  );
}
