/**
 * Client-safe campaign types (no "server-only" import) -- split out from
 * lib/campaigns.ts so client components (lib/campaign-ai.ts, the wizard/
 * editor/preview components) can import them without pulling in the
 * server-only data-access module. Same fix as lib/hardware-catalog.ts
 * earlier this session.
 */
export type CampaignObjective = "sales" | "launch" | "awareness" | "clearance" | "seasonal" | "retargeting";
export type CampaignChannel = "instagram" | "facebook" | "tiktok" | "email" | "whatsapp" | "general";
export type CampaignStatus = "draft" | "ready" | "active" | "paused" | "completed";

/** Only the keys relevant to the campaign's channel are expected to be populated. */
export interface CampaignContent {
  campaignName?: string;
  headline?: string;
  primaryCopy?: string;
  shortDescription?: string;
  cta?: string;
  socialCaptions?: string[];
  hashtags?: string[];
  emailSubject?: string;
  emailBody?: string;
  whatsappMessage?: string;
  audienceDescription?: string;
  strategy?: string;
  contentIdeas?: string[];
  creativeDirection?: string;
  adVariations?: string[];
}

export const CAMPAIGN_OBJECTIVES: { value: CampaignObjective; label: string }[] = [
  { value: "sales", label: "Sales" },
  { value: "launch", label: "Product launch" },
  { value: "awareness", label: "Awareness" },
  { value: "clearance", label: "Clearance" },
  { value: "seasonal", label: "Seasonal promotion" },
  { value: "retargeting", label: "Retargeting" },
];

export const CAMPAIGN_CHANNELS: { value: CampaignChannel; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "general", label: "General campaign" },
];

export const CAMPAIGN_STATUSES: CampaignStatus[] = ["draft", "ready", "active", "paused", "completed"];

/** Which content fields are relevant per channel -- drives both prompt-building and what the editor/preview show. */
export const CHANNEL_FIELDS: Record<CampaignChannel, (keyof CampaignContent)[]> = {
  instagram: ["campaignName", "headline", "primaryCopy", "socialCaptions", "hashtags", "cta"],
  facebook: ["campaignName", "headline", "primaryCopy", "socialCaptions", "hashtags", "cta"],
  tiktok: ["campaignName", "headline", "socialCaptions", "hashtags", "contentIdeas", "cta"],
  email: ["campaignName", "emailSubject", "emailBody", "cta"],
  whatsapp: ["campaignName", "whatsappMessage", "cta"],
  general: [
    "campaignName",
    "headline",
    "shortDescription",
    "audienceDescription",
    "strategy",
    "contentIdeas",
    "creativeDirection",
    "adVariations",
    "cta",
  ],
};
