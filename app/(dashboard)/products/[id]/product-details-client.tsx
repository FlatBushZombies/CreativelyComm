"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Download,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { ImageGallery } from "@/components/products/image-gallery";
import { AIOptimizationPanel } from "@/components/products/ai-optimization-panel";
import { BeforeAfterPreview } from "@/components/products/before-after-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { FadeIn } from "@/components/shared/fade-in";
import type { Product } from "@/lib/products";
import type { ChannelReadiness } from "@/lib/readiness";
import { ChevronDown } from "lucide-react";

const exportFormats = [
  { name: "Shopify CSV", size: "2.4 MB" },
  { name: "Amazon Flat File", size: "1.8 MB" },
  { name: "Google Merchant XML", size: "3.1 MB" },
  { name: "High-Res Images (ZIP)", size: "24.6 MB" },
];

interface ProductDetailsClientProps {
  product: Product;
  channelReadiness: ChannelReadiness[];
}

export function ProductDetailsClient({ product, channelReadiness }: ProductDetailsClientProps) {
  const [copied, setCopied] = useState(false);
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <DashboardHeader title={product.name} description={product.category} />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4" />
                Back to library
              </Link>
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </FadeIn>

        <div className="grid gap-8 lg:grid-cols-2">
          <FadeIn>
            <ImageGallery
              images={product.images}
              optimizedImages={product.optimizedImages}
              productName={product.name}
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">{product.status}</Badge>
                  <Badge variant="muted">{product.sku}</Badge>
                </div>
                <h2 className="mt-3 text-2xl font-bold">{product.name}</h2>
                <p className="mt-2 text-3xl font-bold text-primary">
                  ${product.price.toFixed(2)}
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{product.views}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{product.exports}</p>
                  <p className="text-xs text-muted-foreground">Exports</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{product.images.length}</p>
                  <p className="text-xs text-muted-foreground">Images</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.12} className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Channel Readiness</CardTitle>
              <p className="text-sm text-muted-foreground">
                Listing-quality checks per channel — a starting point to tune, not a
                guarantee of any marketplace&apos;s current policies.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {channelReadiness.map(({ channel, score, failed }) => {
                const isExpanded = expandedChannel === channel.id;
                return (
                  <div key={channel.id} className="rounded-lg border border-border p-4">
                    <button
                      className="flex w-full items-center gap-4 text-left"
                      onClick={() => setExpandedChannel(isExpanded ? null : channel.id)}
                    >
                      <span className="w-32 shrink-0 text-sm font-medium">{channel.name}</span>
                      <Progress value={score} className="h-2 flex-1" />
                      <span className="w-12 shrink-0 text-right text-sm font-medium">{score}%</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                        {failed.length === 0 ? (
                          <p className="text-sm text-emerald-600">All checks passed.</p>
                        ) : (
                          failed.map((rule) => (
                            <p key={rule.id} className="text-sm text-muted-foreground">
                              <Badge variant="warning" className="mr-2">
                                Needs work
                              </Badge>
                              {rule.label}
                            </p>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </FadeIn>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.15}>
            <BeforeAfterPreview
              beforeImage={product.images[0]}
              afterImage={product.optimizedImages[0]}
              productName={product.name}
            />
          </FadeIn>
          <FadeIn delay={0.2}>
            <AIOptimizationPanel />
          </FadeIn>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FadeIn delay={0.25}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Export Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exportFormats.map((format) => (
                  <div
                    key={format.name}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{format.name}</p>
                      <p className="text-xs text-muted-foreground">{format.size}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sharing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">Storefront Link</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Share this product on your branded storefront
                  </p>
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 rounded-md bg-muted px-3 py-2 text-xs truncate">
                      creativelycomm.com/store/{product.id}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/storefront">
                      <ExternalLink className="h-4 w-4" />
                      View Storefront
                    </Link>
                  </Button>
                  <Button className="flex-1">
                    <Share2 className="h-4 w-4" />
                    Share Product
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </>
  );
}
