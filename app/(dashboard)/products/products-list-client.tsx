"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { ProductCard } from "@/components/products/product-card";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { ImportProductsDialog } from "@/components/products/import-products-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

const filters = ["All", "Optimized", "Pending", "Draft", "Published"];

interface ProductsListClientProps {
  products: Product[];
}

export function ProductsListClient({ products }: ProductsListClientProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter =
        activeFilter === "All" ||
        product.status === activeFilter.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [products, search, activeFilter]);

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
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <ImportProductsDialog />
              <AddProductDialog />
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
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
        </FadeIn>

        {filteredProducts.length === 0 ? (
          <FadeIn className="mt-12 text-center">
            <p className="text-muted-foreground">
              {products.length === 0
                ? "No products yet. Add your first product to get started."
                : "No products match your search."}
            </p>
          </FadeIn>
        ) : (
          <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <Badge variant="secondary">{products.filter((p) => p.status === "optimized").length} optimized</Badge>
        </div>
      </div>
    </>
  );
}
