"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, Check, CheckCheck } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok, SiWhatsapp } from "react-icons/si";
import { Mail } from "lucide-react";
import { EditableText } from "@/components/campaigns/editable-text";
import type { CampaignChannel, CampaignContent } from "@/lib/campaign-types";

interface CampaignPreviewProps {
  channel: CampaignChannel;
  content: CampaignContent;
  onContentChange: (content: CampaignContent) => void;
  productImage?: string;
  productName: string;
  brandName: string;
}

type FieldEditorProps = Pick<CampaignPreviewProps, "content" | "onContentChange" | "productName">;

const CHANNEL_ICON: Record<CampaignChannel, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  facebook: SiFacebook,
  tiktok: SiTiktok,
  whatsapp: SiWhatsapp,
  email: Mail,
  general: SiInstagram,
};

function useFieldSetter({ content, onContentChange }: Pick<FieldEditorProps, "content" | "onContentChange">) {
  return function setField(key: keyof CampaignContent, value: string | string[]) {
    onContentChange({ ...content, [key]: value });
  };
}

function SocialPreview({
  content,
  onContentChange,
  productImage,
  productName,
  brandName,
}: FieldEditorProps & { productImage?: string; brandName: string }) {
  const setField = useFieldSetter({ content, onContentChange });
  const usingCaptions = Array.isArray(content.socialCaptions) && content.socialCaptions.length > 0;
  const captionValue = usingCaptions ? content.socialCaptions![0] : content.primaryCopy ?? "";

  function setCaption(next: string) {
    if (usingCaptions) {
      const nextCaptions = [...(content.socialCaptions ?? [])];
      nextCaptions[0] = next;
      setField("socialCaptions", nextCaptions);
    } else {
      setField("primaryCopy", next);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {brandName.slice(0, 2).toUpperCase()}
        </div>
        <p className="text-sm font-semibold">{brandName}</p>
      </div>
      <div className="relative aspect-square bg-muted">
        {productImage && <Image src={productImage} alt="" fill className="object-cover" sizes="384px" />}
      </div>
      <div className="flex items-center gap-3 p-3 text-muted-foreground">
        <Heart className="h-5 w-5" />
        <MessageCircle className="h-5 w-5" />
        <Send className="h-5 w-5" />
      </div>
      <div className="space-y-1.5 px-3 pb-4">
        <EditableText
          value={content.headline ?? ""}
          onChange={(v) => setField("headline", v)}
          productName={productName}
          fieldLabel="Headline"
          placeholder="Headline"
          className="text-sm font-semibold"
        />
        <div className="text-sm">
          <span className="font-semibold">{brandName}</span>{" "}
          <EditableText
            value={captionValue}
            onChange={setCaption}
            productName={productName}
            fieldLabel="Caption"
            placeholder="Write a caption…"
            multiline
            className="text-sm"
          />
        </div>
        <EditableText
          value={(content.hashtags ?? []).join(" ")}
          onChange={(v) => setField("hashtags", v.split(/\s+/).filter(Boolean))}
          productName={productName}
          fieldLabel="Hashtags"
          placeholder="#yourproduct #shopsmall"
          className="text-sm text-primary"
        />
        <EditableText
          value={content.cta ?? ""}
          onChange={(v) => setField("cta", v)}
          productName={productName}
          fieldLabel="Call to action"
          placeholder="Shop now"
          className="text-sm font-medium text-primary"
        />
      </div>
    </div>
  );
}

function EmailPreview({ content, onContentChange, productName, brandName }: FieldEditorProps & { brandName: string }) {
  const setField = useFieldSetter({ content, onContentChange });

  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-muted/40 p-4">
        <p className="text-xs text-muted-foreground">From: {brandName}</p>
        <EditableText
          value={content.emailSubject ?? ""}
          onChange={(v) => setField("emailSubject", v)}
          productName={productName}
          fieldLabel="Email subject"
          placeholder="(No subject yet)"
          className="mt-1 text-sm font-semibold"
        />
      </div>
      <div className="space-y-4 p-5">
        <EditableText
          value={content.emailBody ?? ""}
          onChange={(v) => setField("emailBody", v)}
          productName={productName}
          fieldLabel="Email body"
          placeholder="(No body yet)"
          multiline
          className="text-sm leading-relaxed"
        />
        <span className="inline-block rounded-full bg-primary px-4 py-2 text-primary-foreground">
          <EditableText
            value={content.cta ?? ""}
            onChange={(v) => setField("cta", v)}
            productName={productName}
            fieldLabel="Call to action"
            placeholder="Shop now"
            fit="content"
            align="center"
            className="text-sm font-medium text-primary-foreground placeholder:text-primary-foreground/70"
          />
        </span>
      </div>
    </div>
  );
}

function WhatsAppPreview({ content, onContentChange, productName, brandName }: FieldEditorProps & { brandName: string }) {
  const setField = useFieldSetter({ content, onContentChange });

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-[#e5ddd5] p-4 dark:bg-muted">
      <p className="mb-3 text-center text-[11px] text-muted-foreground">{brandName}</p>
      <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#dcf8c6] p-3 shadow-sm dark:bg-primary/20">
        <EditableText
          value={content.whatsappMessage ?? ""}
          onChange={(v) => setField("whatsappMessage", v)}
          productName={productName}
          fieldLabel="WhatsApp message"
          placeholder="(No message yet)"
          multiline
          className="text-sm text-foreground"
        />
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>now</span>
          <CheckCheck className="h-3 w-3 text-blue-500" />
        </div>
      </div>
    </div>
  );
}

function GeneralPreview({ content, onContentChange, productName }: FieldEditorProps) {
  const setField = useFieldSetter({ content, onContentChange });

  const rows: { label: string; key: keyof CampaignContent; list?: boolean }[] = [
    { label: "Objective", key: "strategy" },
    { label: "Target audience", key: "audienceDescription" },
    { label: "Core message", key: "primaryCopy" },
    { label: "Content ideas", key: "contentIdeas", list: true },
    { label: "Creative direction", key: "creativeDirection" },
    { label: "Ad variations", key: "adVariations", list: true },
  ];

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <EditableText
          value={content.campaignName ?? ""}
          onChange={(v) => setField("campaignName", v)}
          productName={productName}
          fieldLabel="Campaign name"
          placeholder="Untitled campaign"
          className="text-lg font-bold"
        />
        <EditableText
          value={content.headline ?? ""}
          onChange={(v) => setField("headline", v)}
          productName={productName}
          fieldLabel="Headline"
          placeholder="Headline"
          className="mt-1 text-sm text-muted-foreground"
        />
      </div>
      {rows.map((row) => (
        <div key={row.key}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{row.label}</p>
          <EditableText
            value={row.list ? ((content[row.key] as string[] | undefined) ?? []).join("\n") : ((content[row.key] as string | undefined) ?? "")}
            onChange={(v) => setField(row.key, row.list ? v.split("\n").map((l) => l.trim()).filter(Boolean) : v)}
            productName={productName}
            fieldLabel={row.label}
            placeholder={row.list ? "One idea per line…" : `Add ${row.label.toLowerCase()}…`}
            multiline
            className="mt-1 text-sm"
          />
        </div>
      ))}
      <span className="inline-block rounded-full bg-primary px-4 py-2 text-primary-foreground">
        <EditableText
          value={content.cta ?? ""}
          onChange={(v) => setField("cta", v)}
          productName={productName}
          fieldLabel="Call to action"
          placeholder="Shop now"
          fit="content"
          align="center"
          className="text-sm font-medium text-primary-foreground placeholder:text-primary-foreground/70"
        />
      </span>
    </div>
  );
}

export function CampaignPreview({ channel, content, onContentChange, productImage, productName, brandName }: CampaignPreviewProps) {
  const Icon = CHANNEL_ICON[channel];
  const hasContent = Object.keys(content).length > 0;

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            {channel === "general" ? "General campaign" : `${channel[0].toUpperCase()}${channel.slice(1)} preview`}
          </Badge>
          {hasContent && (
            <p className="hidden text-xs text-muted-foreground sm:block">
              Click any text to edit it — hover for AI suggestions
            </p>
          )}
        </div>

        {hasContent ? (
          <>
            {(channel === "instagram" || channel === "facebook" || channel === "tiktok") && (
              <SocialPreview
                content={content}
                onContentChange={onContentChange}
                productImage={productImage}
                productName={productName}
                brandName={brandName}
              />
            )}
            {channel === "email" && (
              <EmailPreview content={content} onContentChange={onContentChange} productName={productName} brandName={brandName} />
            )}
            {channel === "whatsapp" && (
              <WhatsAppPreview content={content} onContentChange={onContentChange} productName={productName} brandName={brandName} />
            )}
            {channel === "general" && (
              <GeneralPreview content={content} onContentChange={onContentChange} productName={productName} />
            )}
          </>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            <Check className="mr-1 inline h-3.5 w-3.5" />
            Generate a campaign to see a preview here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
