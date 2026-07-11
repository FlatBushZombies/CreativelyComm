import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProductById } from "@/lib/products";
import { getChannelsWithReadiness } from "@/lib/readiness";
import { getProductVersions } from "@/lib/versions";
import { getProductTranslations } from "@/lib/translations";
import { ProductDetailsClient } from "./product-details-client";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const product = await getProductById(id, workspace.id);

  if (!product) {
    notFound();
  }

  const [channelReadiness, versions, translations] = await Promise.all([
    getChannelsWithReadiness(product, workspace.id),
    getProductVersions(product.id, workspace.id),
    getProductTranslations(product.id, workspace.id),
  ]);

  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const productUrl = `${origin}/store/${workspace.slug}/products/${product.id}`;

  return (
    <ProductDetailsClient
      product={product}
      channelReadiness={channelReadiness}
      productUrl={productUrl}
      versions={versions}
      translations={translations}
    />
  );
}
