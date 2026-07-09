import { notFound } from "next/navigation";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { getProducts } from "@/lib/products";

interface EmbedStorefrontPageProps {
  params: Promise<{ slug: string }>;
}

// Public, iframe-embeddable product grid widget — no header/nav chrome, no
// auth. Not under (dashboard), so proxy.ts's protected prefixes don't apply.
export default async function EmbedStorefrontPage({ params }: EmbedStorefrontPageProps) {
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
    <div className="bg-background">
      <StorefrontView
        workspace={workspace}
        products={publishedProducts}
        productHref={(productId) => `/store/${slug}/products/${productId}`}
        variant="embed"
      />
    </div>
  );
}
