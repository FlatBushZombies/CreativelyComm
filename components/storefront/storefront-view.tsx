import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import type { Product } from "@/lib/products";
import type { Workspace } from "@/lib/workspace";

interface StorefrontViewProps {
  workspace: Pick<Workspace, "name" | "storeName" | "storeTagline" | "brandColor" | "hideBranding">;
  products: Product[];
  productHref: (productId: string) => string;
  variant?: "full" | "embed";
}

export function StorefrontView({ workspace, products, productHref, variant = "full" }: StorefrontViewProps) {
  const isEmbed = variant === "embed";
  const storeName = workspace.storeName || workspace.name;
  const tagline = workspace.storeTagline || "Quality products, thoughtfully made.";
  const initials = storeName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Store Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-sm"
                style={{ backgroundColor: workspace.brandColor }}
              >
                {initials}
              </div>
              <div>
                <h2 className="font-semibold">{storeName}</h2>
                <p className="text-xs text-muted-foreground">{tagline}</p>
              </div>
            </div>
            {!isEmbed && (
              <>
                <nav className="hidden sm:flex items-center gap-6 text-sm">
                  <span className="font-medium" style={{ color: workspace.brandColor }}>
                    Shop
                  </span>
                  <span className="text-muted-foreground">About</span>
                  <span className="text-muted-foreground">Contact</span>
                </nav>
                <Button size="sm" variant="outline">
                  <ShoppingBag className="h-4 w-4" />
                  Cart (0)
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div
        className="relative px-6 py-16 text-center text-white"
        style={{ backgroundColor: workspace.brandColor }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.10),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        <div className="relative">
          <h1 className="font-display text-3xl font-medium sm:text-5xl">{storeName}</h1>
          <p className="mx-auto mt-3 max-w-md text-white/80">{tagline}</p>
          <Button variant="secondary" className="mt-6" size="lg">
            Shop Collection
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="bg-background px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl font-medium">Featured Products</h3>
            <span className="text-sm text-muted-foreground">{products.length} items</span>
          </div>

          {products.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No products are published yet — check back soon.
            </p>
          ) : (
            <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <StaggerItem key={product.id}>
                  <Link
                    href={productHref(product.id)}
                    target={isEmbed ? "_blank" : undefined}
                    rel={isEmbed ? "noopener noreferrer" : undefined}
                    className="group block rounded-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted card-shadow transition-shadow duration-300 group-hover:card-shadow-glow">
                      {(product.optimizedImages[0] || product.images[0]) && (
                        <Image
                          src={product.optimizedImages[0] || product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      )}
                      {product.status === "optimized" && (
                        <Badge className="absolute top-3 left-3" variant="default">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-display text-lg">${product.price.toFixed(2)}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          4.8
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </div>

      {/* Store Footer */}
      {!workspace.hideBranding && (
        <div className="border-t border-border bg-muted/30 px-6 py-8">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm text-muted-foreground">
              Powered by <span className="font-medium text-primary">CreativelyComm</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
