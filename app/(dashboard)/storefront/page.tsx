import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { FadeIn } from "@/components/shared/fade-in";
import { StorefrontView } from "@/components/storefront/storefront-view";
import { ShareStoreButtons } from "@/components/storefront/share-store-buttons";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProducts } from "@/lib/products";

export default async function StorefrontPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const products = await getProducts(workspace.id);
  const featuredProducts = products.filter((p) =>
    ["optimized", "published"].includes(p.status)
  );

  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const storeUrl = `${origin}/store/${workspace.slug}`;

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
                {storeUrl.replace(/^https?:\/\//, "")}
              </span>
            </div>
            <ShareStoreButtons url={storeUrl} />
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="overflow-hidden rounded-xl border border-border card-shadow-lg">
            <StorefrontView
              workspace={workspace}
              products={featuredProducts}
              productHref={(productId) => `/products/${productId}`}
            />
          </div>
        </FadeIn>
      </div>
    </>
  );
}
