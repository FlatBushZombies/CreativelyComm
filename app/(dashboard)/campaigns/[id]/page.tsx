import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getCampaignById } from "@/lib/campaigns";
import { getProductById } from "@/lib/products";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { CampaignWorkspace } from "@/components/campaigns/campaign-workspace";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  const campaign = await getCampaignById(id, workspace.id);
  if (!campaign) {
    notFound();
  }

  const product = campaign.productId ? await getProductById(campaign.productId, workspace.id) : null;
  if (!product) {
    notFound();
  }

  return (
    <>
      <DashboardHeader title={campaign.name} description={`Campaign for ${product.name}`} />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-4 w-4" />
            Back to campaigns
          </Link>
        </Button>

        <CampaignWorkspace campaign={campaign} product={product} brandName={workspace.storeName || workspace.name} />
      </div>
    </>
  );
}
