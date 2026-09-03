"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CampaignSettingsForm } from "@/components/campaigns/campaign-settings-form";
import { CampaignPreview } from "@/components/campaigns/campaign-preview";
import { generateProductCampaign, type CampaignSettings } from "@/lib/campaign-ai";
import type { CampaignContent } from "@/lib/campaign-types";
import {
  saveGeneratedCampaignContentAction,
  updateCampaignContentAction,
  updateCampaignSettingsAction,
} from "@/app/(dashboard)/campaigns/actions";
import type { Product } from "@/lib/products";
import type { Campaign } from "@/lib/campaigns";

interface CampaignWorkspaceProps {
  campaign: Campaign;
  product: Product;
  brandName: string;
}

function hasContent(content: CampaignContent): boolean {
  return Object.keys(content).length > 0;
}

export function CampaignWorkspace({ campaign, product, brandName }: CampaignWorkspaceProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"settings" | "edit">(hasContent(campaign.content) ? "edit" : "settings");
  const [content, setContent] = useState<CampaignContent>(campaign.content);
  const [settings, setSettings] = useState<CampaignSettings>({
    objective: campaign.objective,
    channel: campaign.channel,
    audience: campaign.audience ?? undefined,
    tone: campaign.tone ?? undefined,
    duration: campaign.duration ?? undefined,
    offer: campaign.offer ?? undefined,
    additionalInstructions: campaign.additionalInstructions ?? undefined,
  });
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleGenerate(nextSettings: CampaignSettings) {
    setSettings(nextSettings);
    setGenerateError(null);
    setGenerating(true);
    try {
      const generated = await generateProductCampaign(product, nextSettings);
      setContent(generated);
      await Promise.all([
        saveGeneratedCampaignContentAction(campaign.id, generated),
        updateCampaignSettingsAction(campaign.id, nextSettings),
      ]);
      setTab("edit");
      router.refresh();
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "We couldn't generate this campaign right now. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateCampaignContentAction(campaign.id, content);
      router.refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:w-fit">
        <TabsTrigger value="settings">Generate</TabsTrigger>
        <TabsTrigger value="edit" disabled={!hasContent(content)}>
          Edit &amp; preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <CampaignSettingsForm initial={settings} generating={generating} error={generateError} onGenerate={handleGenerate} />
      </TabsContent>

      <TabsContent value="edit" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Click any text below to edit it directly, or use <span className="font-medium text-foreground">✨</span> for an AI rewrite.
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleGenerate(settings)} disabled={generating}>
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Regenerate all
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : null}
              {saved ? "Saved" : "Save changes"}
            </Button>
          </div>
        </div>

        <CampaignPreview
          channel={settings.channel}
          content={content}
          onContentChange={setContent}
          productImage={product.optimizedImages[0] ?? product.images[0]}
          productName={product.name}
          brandName={brandName}
        />
      </TabsContent>
    </Tabs>
  );
}
