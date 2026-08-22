import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getCampaigns } from "@/lib/campaigns";
import { getProducts } from "@/lib/products";
import { CampaignsListClient } from "@/components/campaigns/campaigns-list-client";

export default async function CampaignsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const [campaigns, products] = await Promise.all([getCampaigns(workspace.id), getProducts(workspace.id)]);

  const productNameById = new Map(products.map((p) => [p.id, p.name]));
  const campaignsWithProductName = campaigns.map((c) => ({
    ...c,
    productName: (c.productId && productNameById.get(c.productId)) || "Deleted product",
  }));

  return <CampaignsListClient campaigns={campaignsWithProductName} />;
}
