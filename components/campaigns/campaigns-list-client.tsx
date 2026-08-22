"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Copy, Trash2, Play, Pause } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { SiInstagram, SiFacebook, SiTiktok, SiWhatsapp } from "react-icons/si";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Campaign, CampaignStatus, CampaignChannel } from "@/lib/campaigns";
import { duplicateCampaignAction, deleteCampaignAction, setCampaignStatusAction } from "@/app/(dashboard)/campaigns/actions";

const filters: (CampaignStatus | "All")[] = ["All", "draft", "active", "completed"];
const filterLabels: Record<string, string> = { All: "All", draft: "Drafts", active: "Active", completed: "Completed" };

const statusVariant: Record<CampaignStatus, "secondary" | "success" | "warning" | "muted"> = {
  draft: "muted",
  ready: "secondary",
  active: "success",
  paused: "warning",
  completed: "secondary",
};

const channelIcon: Record<CampaignChannel, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  facebook: SiFacebook,
  tiktok: SiTiktok,
  whatsapp: SiWhatsapp,
  email: Mail,
  general: Mail,
};

interface CampaignWithProductName extends Campaign {
  productName: string;
}

interface CampaignsListClientProps {
  campaigns: CampaignWithProductName[];
}

export function CampaignsListClient({ campaigns }: CampaignsListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<CampaignStatus | "All">("All");
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) || c.productName.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "All" || c.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [campaigns, search, activeFilter]);

  function handleDuplicate(id: string) {
    const formData = new FormData();
    formData.set("campaignId", id);
    startTransition(async () => {
      await duplicateCampaignAction(formData);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.set("campaignId", id);
    startTransition(async () => {
      await deleteCampaignAction(formData);
      router.refresh();
    });
  }

  function handleToggleStatus(id: string, current: CampaignStatus) {
    const formData = new FormData();
    formData.set("campaignId", id);
    formData.set("status", current === "active" ? "paused" : "active");
    startTransition(async () => {
      await setCampaignStatusAction(formData);
      router.refresh();
    });
  }

  return (
    <>
      <DashboardHeader title="Campaigns" description={`${campaigns.length} AI-generated campaign${campaigns.length === 1 ? "" : "s"}`} />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <FadeIn>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by campaign or product..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">Create a campaign from any product&apos;s page</p>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {filterLabels[filter]}
              </button>
            ))}
          </div>
        </FadeIn>

        {filtered.length === 0 ? (
          <FadeIn className="mt-12 text-center">
            <p className="text-muted-foreground">
              {campaigns.length === 0
                ? "No campaigns yet — create one from any product's page."
                : "No campaigns match your search."}
            </p>
          </FadeIn>
        ) : (
          <StaggerContainer className="mt-6 space-y-3">
            {filtered.map((campaign) => {
              const Icon = channelIcon[campaign.channel];
              return (
                <StaggerItem key={campaign.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/25">
                    <Link href={`/campaigns/${campaign.id}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <p className="truncate text-sm font-medium">{campaign.name}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {campaign.productName} · {campaign.objective} · Updated {new Date(campaign.updatedAt).toLocaleDateString()}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusVariant[campaign.status]} className="capitalize">
                        {campaign.status}
                      </Badge>
                      {(campaign.status === "active" || campaign.status === "paused") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={isPending}
                          onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                          aria-label={campaign.status === "active" ? "Pause" : "Activate"}
                        >
                          {campaign.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={isPending}
                        onClick={() => handleDuplicate(campaign.id)}
                        aria-label="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={isPending}
                        onClick={() => handleDelete(campaign.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </>
  );
}
