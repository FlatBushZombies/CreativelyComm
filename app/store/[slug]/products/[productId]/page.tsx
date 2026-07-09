import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicImageGallery } from "@/components/storefront/public-image-gallery";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { getProductById, incrementProductViews } from "@/lib/products";

interface PublicProductPageProps {
  params: Promise<{ slug: string; productId: string }>;
}

export default async function PublicProductPage({ params }: PublicProductPageProps) {
  const { slug, productId } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const product = await getProductById(productId, workspace.id);
  if (!product || !["optimized", "published"].includes(product.status)) {
    notFound();
  }

  await incrementProductViews(product.id);

  const images = product.optimizedImages.length > 0 ? product.optimizedImages : product.images;
  const storeName = workspace.storeName || workspace.name;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo size="sm" />
          <Link
            href={`/store/${slug}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to {storeName}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <PublicImageGallery images={images} productName={product.name} />

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                {product.category && <Badge variant="secondary">{product.category}</Badge>}
                {product.sku && <Badge variant="muted">{product.sku}</Badge>}
              </div>
              <h1 className="font-display mt-3 text-4xl font-medium">{product.name}</h1>
              <p
                className="mt-2 text-3xl font-display"
                style={{ color: workspace.brandColor }}
              >
                ${product.price.toFixed(2)}
              </p>
              {product.description && (
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator />

            <p className="text-sm text-muted-foreground">
              Sold by <span className="font-medium text-foreground">{storeName}</span>
            </p>
          </div>
        </div>
      </div>

      {!workspace.hideBranding && (
        <footer className="border-t border-border bg-muted/30 px-6 py-8">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm text-muted-foreground">
              Powered by <span className="font-medium text-primary">CreativelyComm</span>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
