import { notFound } from "next/navigation";
import { Logo } from "@/components/shared/logo";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { getProducts } from "@/lib/products";

interface PublicStorefrontPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicStorefrontPage({ params }: PublicStorefrontPageProps) {
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) {
    notFound();
  }

  const products = await getProducts(workspace.id);
  const publishedProducts = products.filter((p) =>
    ["optimized", "published"].includes(p.status)
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 px-6 py-3 backdrop-blur-xl">
        <Logo size="sm" />
      </header>
      <StorefrontView
        workspace={workspace}
        products={publishedProducts}
        productHref={(productId) => `/store/${slug}/products/${productId}`}
      />
    </div>
  );
}
