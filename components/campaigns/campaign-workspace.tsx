"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignSettingsForm } from "@/components/campaigns/campaign-settings-form";
import { CampaignEditor } from "@/components/campaigns/campaign-editor";
import { CampaignPreview } from "@/components/campaigns/campaign-preview";
import { generateProductCampaign, type CampaignSettings } from "@/lib/campaign-ai";
import { CHANNEL_FIELDS, type CampaignContent } from "@/lib/campaign-types";
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
  const [tab, setTab] = useState<"settings" | "edit" | "preview">(hasContent(campaign.content) ? "edit" : "settings");
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
    try {
      await updateCampaignContentAction(campaign.id, content);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const fields = CHANNEL_FIELDS[settings.channel];

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 sm:w-fit">
        <TabsTrigger value="settings">Generate</TabsTrigger>
        <TabsTrigger value="edit" disabled={!hasContent(content)}>
          Edit
        </TabsTrigger>
        <TabsTrigger value="preview" disabled={!hasContent(content)}>
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <CampaignSettingsForm initial={settings} generating={generating} error={generateError} onGenerate={handleGenerate} />
      </TabsContent>

      <TabsContent value="edit">
        <CampaignEditor
          content={content}
          fields={fields}
          productName={product.name}
          onContentChange={setContent}
          onSave={handleSave}
          onRegenerateAll={() => handleGenerate(settings)}
          saving={saving}
          regenerating={generating}
        />
      </TabsContent>

      <TabsContent value="preview">
        <CampaignPreview
          channel={settings.channel}
          content={content}
          productImage={product.optimizedImages[0] ?? product.images[0]}
          productName={product.name}
          brandName={brandName}
        />
      </TabsContent>
    </Tabs>
  );
}
