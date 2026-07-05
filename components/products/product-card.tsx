import Link from "next/link";
import Image from "next/image";
import { Eye, Download, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product, ProductStatus } from "@/lib/mock-data";

const statusConfig: Record<ProductStatus, { label: string; variant: "success" | "warning" | "muted" | "default" }> = {
  optimized: { label: "Optimized", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  draft: { label: "Draft", variant: "muted" },
  published: { label: "Published", variant: "default" },
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const status = statusConfig[product.status];

  return (
    <Card className="group overflow-hidden transition-all hover:card-shadow-lg hover:border-primary/20">
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-medium truncate hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {product.views}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {product.exports}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
