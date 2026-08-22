"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Send, Check, CheckCheck } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok, SiWhatsapp } from "react-icons/si";
import { Mail } from "lucide-react";
import type { CampaignChannel, CampaignContent } from "@/lib/campaign-types";

interface CampaignPreviewProps {
  channel: CampaignChannel;
  content: CampaignContent;
  productImage?: string;
  productName: string;
  brandName: string;
}

const CHANNEL_ICON: Record<CampaignChannel, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  facebook: SiFacebook,
  tiktok: SiTiktok,
  whatsapp: SiWhatsapp,
  email: Mail,
  general: SiInstagram,
};

function SocialPreview({ content, productImage, brandName }: Omit<CampaignPreviewProps, "channel">) {
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
        {content.headline && <p className="text-sm font-semibold">{content.headline}</p>}
        <p className="text-sm">
          <span className="font-semibold">{brandName}</span>{" "}
          {content.socialCaptions?.[0] ?? content.primaryCopy}
        </p>
        {content.hashtags && content.hashtags.length > 0 && (
          <p className="text-sm text-primary">{content.hashtags.join(" ")}</p>
        )}
        {content.cta && <p className="text-sm font-medium text-primary">{content.cta} →</p>}
      </div>
    </div>
  );
}

function EmailPreview({ content, brandName }: Omit<CampaignPreviewProps, "channel" | "productImage">) {
  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border bg-muted/40 p-4">
        <p className="text-xs text-muted-foreground">From: {brandName}</p>
        <p className="mt-1 text-sm font-semibold">{content.emailSubject || "(No subject yet)"}</p>
      </div>
      <div className="space-y-4 p-5">
        <p className="whitespace-pre-line text-sm leading-relaxed">{content.emailBody || "(No body yet)"}</p>
        {content.cta && (
          <span className="inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {content.cta}
          </span>
        )}
      </div>
    </div>
  );
}

function WhatsAppPreview({ content, brandName }: Omit<CampaignPreviewProps, "channel" | "productImage">) {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-[#e5ddd5] p-4 dark:bg-muted">
      <p className="mb-3 text-center text-[11px] text-muted-foreground">{brandName}</p>
      <div className="ml-auto max-w-[85%] rounded-lg rounded-tr-none bg-[#dcf8c6] p-3 shadow-sm dark:bg-primary/20">
        <p className="whitespace-pre-line text-sm text-foreground">{content.whatsappMessage || "(No message yet)"}</p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>now</span>
          <CheckCheck className="h-3 w-3 text-blue-500" />
        </div>
      </div>
    </div>
  );
}

function GeneralPreview({ content }: Pick<CampaignPreviewProps, "content">) {
  const rows: { label: string; value?: string | string[] }[] = [
    { label: "Objective", value: content.strategy },
    { label: "Target audience", value: content.audienceDescription },
    { label: "Core message", value: content.primaryCopy || content.headline },
    { label: "Content ideas", value: content.contentIdeas },
    { label: "Creative direction", value: content.creativeDirection },
    { label: "Ad variations", value: content.adVariations },
  ];

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <p className="text-lg font-bold">{content.campaignName || "Untitled campaign"}</p>
        {content.headline && <p className="mt-1 text-sm text-muted-foreground">{content.headline}</p>}
      </div>
      {rows
        .filter((r) => r.value && r.value.length > 0)
        .map((row) => (
          <div key={row.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{row.label}</p>
            {Array.isArray(row.value) ? (
              <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm">
                {row.value.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm">{row.value}</p>
            )}
          </div>
        ))}
      {content.cta && (
        <span className="inline-block rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {content.cta}
        </span>
      )}
    </div>
  );
}

export function CampaignPreview({ channel, content, productImage, productName, brandName }: CampaignPreviewProps) {
  const Icon = CHANNEL_ICON[channel];

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <Badge variant="secondary" className="gap-1.5">
          <Icon className="h-3.5 w-3.5" />
          {channel === "general" ? "General campaign" : `${channel[0].toUpperCase()}${channel.slice(1)} preview`}
        </Badge>

        {(channel === "instagram" || channel === "facebook" || channel === "tiktok") && (
          <SocialPreview content={content} productImage={productImage} productName={productName} brandName={brandName} />
        )}
        {channel === "email" && <EmailPreview content={content} productName={productName} brandName={brandName} />}
        {channel === "whatsapp" && <WhatsAppPreview content={content} productName={productName} brandName={brandName} />}
        {channel === "general" && <GeneralPreview content={content} />}

        {!content.headline && !content.primaryCopy && !content.emailBody && !content.whatsappMessage && !content.strategy && (
          <p className="text-center text-sm text-muted-foreground">
            <Check className="mr-1 inline h-3.5 w-3.5" />
            Generate a campaign to see a preview here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
