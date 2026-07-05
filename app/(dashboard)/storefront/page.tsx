"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Share2, ShoppingBag, Star } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { products } from "@/lib/mock-data";

const featuredProducts = products.filter((p) =>
  ["optimized", "published"].includes(p.status)
);

export default function StorefrontPage() {
  return (
    <>
      <DashboardHeader
        title="Storefront Preview"
        description="Preview your branded online store"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="success">Live</Badge>
              <span className="text-sm text-muted-foreground">
                creativelycomm.com/store/artisan-co
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
                Share Store
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Storefront Preview Frame */}
        <FadeIn delay={0.1}>
          <div className="overflow-hidden rounded-xl border border-border card-shadow-lg">
            {/* Store Header */}
            <div className="border-b border-border bg-card">
              <div className="mx-auto max-w-5xl px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                      AC
                    </div>
                    <div>
                      <h2 className="font-semibold">Artisan Co.</h2>
                      <p className="text-xs text-muted-foreground">Handcrafted with love</p>
                    </div>
                  </div>
                  <nav className="hidden sm:flex items-center gap-6 text-sm">
                    <span className="font-medium text-primary">Shop</span>
                    <span className="text-muted-foreground">About</span>
                    <span className="text-muted-foreground">Contact</span>
                  </nav>
                  <Button size="sm" variant="outline">
                    <ShoppingBag className="h-4 w-4" />
                    Cart (0)
                  </Button>
                </div>
              </div>
            </div>

            {/* Hero Banner */}
            <div className="relative bg-primary px-6 py-16 text-center text-white">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
              <div className="relative">
                <h1 className="text-3xl font-bold sm:text-4xl">
                  Curated Essentials for Modern Living
                </h1>
                <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
                  Discover our collection of handcrafted products, designed with care
                  and built to last.
                </p>
                <Button
                  variant="secondary"
                  className="mt-6"
                  size="lg"
                >
                  Shop Collection
                </Button>
              </div>
            </div>

            {/* Product Grid */}
            <div className="bg-background px-6 py-12">
              <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-semibold">Featured Products</h3>
                  <span className="text-sm text-muted-foreground">
                    {featuredProducts.length} items
                  </span>
                </div>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredProducts.map((product) => (
                    <StaggerItem key={product.id}>
                      <Link
                        href={`/products/${product.id}`}
                        className="group block"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                          <Image
                            src={product.optimizedImages[0] || product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 33vw"
                          />
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
                            <span className="font-semibold">
                              ${product.price.toFixed(2)}
                            </span>
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
              </div>
            </div>

            {/* Store Footer */}
            <div className="border-t border-border bg-muted/30 px-6 py-8">
              <div className="mx-auto max-w-5xl text-center">
                <p className="text-sm text-muted-foreground">
                  Powered by{" "}
                  <span className="font-medium text-primary">CreativelyComm</span>
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
