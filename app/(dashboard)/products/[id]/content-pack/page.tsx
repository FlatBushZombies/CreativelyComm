import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProductById } from "@/lib/products";
import { getActiveContentPackForProduct, getContentPackAssets } from "@/lib/content-packs";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { ContentPackWorkspace } from "@/components/content-pack/content-pack-workspace";

export default async function ContentPackPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  const product = await getProductById(id, workspace.id);
  if (!product) {
    notFound();
  }

  const existingPack = await getActiveContentPackForProduct(product.id, workspace.id);
  const existingAssets = existingPack ? await getContentPackAssets(existingPack.id, workspace.id) : [];

  return (
    <>
      <DashboardHeader title="Content Pack" description={`Platform-ready images for ${product.name}`} />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/products/${product.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to product
          </Link>
        </Button>

        <ContentPackWorkspace product={product} existingPack={existingPack} existingAssets={existingAssets} />
      </div>
    </>
  );
}
