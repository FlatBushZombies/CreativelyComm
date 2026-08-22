"use client";

import type { Product } from "@/lib/products";
import { generateText } from "@/lib/puter";
import { CHANNEL_FIELDS, type CampaignChannel, type CampaignContent, type CampaignObjective } from "@/lib/campaign-types";

/**
 * Client-side AI campaign generation, built on the same Puter.js
 * infrastructure as the Lifestyle Background image tool (lib/puter.ts) --
 * this codebase has no server-side LLM provider (no OpenAI/Anthropic key,
 * checked before building this), so Puter's "user pays" chat() is the only
 * real AI text-generation capability available. The call itself runs in
 * the browser; everything security-sensitive (ownership checks,
 * persistence) happens in real server actions once generation is done.
 */
export interface CampaignSettings {
  objective: CampaignObjective;
  channel: CampaignChannel;
  audience?: string;
  tone?: string;
  duration?: string;
  offer?: string;
  additionalInstructions?: string;
}

const FIELD_DESCRIPTIONS: Record<keyof CampaignContent, string> = {
  campaignName: "a short internal campaign name (not shown to customers)",
  headline: "a punchy headline for the campaign",
  primaryCopy: "the main marketing copy, 2-4 sentences",
  shortDescription: "a one-sentence summary of the campaign",
  cta: "a short call-to-action phrase",
  socialCaptions: "an array of 2-3 alternative social captions",
  hashtags: "an array of 5-8 relevant hashtags, each starting with #",
  emailSubject: "an email subject line",
  emailBody: "the full email body, plain text with paragraph breaks",
  whatsappMessage: "a short WhatsApp-style promotional message with light emoji use",
  audienceDescription: "a 1-2 sentence description of the target audience",
  strategy: "a short paragraph describing the overall campaign strategy",
  contentIdeas: "an array of 3-5 short content ideas",
  creativeDirection: "a short paragraph describing the visual/creative direction",
  adVariations: "an array of 2-3 alternative ad copy variations",
};

function buildPrompt(product: Product, settings: CampaignSettings): string {
  const fields = CHANNEL_FIELDS[settings.channel];
  const schema = fields.map((f) => `  "${f}": ${FIELD_DESCRIPTIONS[f].startsWith("an array") ? "[...]" : "\"...\""} // ${FIELD_DESCRIPTIONS[f]}`).join("\n");

  return `You are a marketing copywriter for a small ecommerce seller. Write a real marketing campaign for this exact product -- no placeholders, no generic filler.

Product:
- Name: ${product.name}
- Description: ${product.description || "(no description provided)"}
- Price: $${product.price.toFixed(2)}
- Category: ${product.category || "uncategorized"}
- Tags: ${product.tags.length > 0 ? product.tags.join(", ") : "(none)"}

Campaign brief:
- Objective: ${settings.objective}
- Channel: ${settings.channel}
- Target audience: ${settings.audience || "(use your best judgment based on the product)"}
- Tone of voice: ${settings.tone || "confident and clear"}
- Duration: ${settings.duration || "(not specified)"}
- Offer/discount: ${settings.offer || "(none)"}
- Additional instructions: ${settings.additionalInstructions || "(none)"}

Respond with ONLY a single JSON object (no markdown fences, no commentary before or after) with exactly these keys:
{
${schema}
}`;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

function parseCampaignContent(raw: string, expectedFields: (keyof CampaignContent)[]): CampaignContent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(raw));
  } catch {
    throw new Error("We couldn't generate this campaign right now. Please try again.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("We couldn't generate this campaign right now. Please try again.");
  }

  const result: CampaignContent = {};
  const source = parsed as Record<string, unknown>;
  for (const field of expectedFields) {
    const value = source[field];
    if (Array.isArray(value)) {
      result[field] = value.filter((v): v is string => typeof v === "string") as never;
    } else if (typeof value === "string" && value.trim()) {
      result[field] = value.trim() as never;
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("The AI response didn't include usable campaign content. Please try again.");
  }

  return result;
}

export async function generateProductCampaign(product: Product, settings: CampaignSettings): Promise<CampaignContent> {
  if (!product.name.trim()) {
    throw new Error("This product needs a name before a campaign can be generated.");
  }

  const prompt = buildPrompt(product, settings);

  let raw: string;
  try {
    raw = await generateText(prompt, { temperature: 0.7 });
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "We couldn't generate this campaign right now. Please try again.");
  }

  return parseCampaignContent(raw, CHANNEL_FIELDS[settings.channel]);
}

/** Backs every per-field action: Regenerate / Improve / Shorten / Make more persuasive / professional / casual. */
export async function refineCampaignField(
  currentText: string,
  instruction: string,
  context: { productName: string; fieldLabel: string }
): Promise<string> {
  const prompt = `You are editing one field of a marketing campaign for the product "${context.productName}".

Field: ${context.fieldLabel}
Current text: "${currentText}"

Instruction: ${instruction}

Respond with ONLY the revised text for this field -- no quotes, no explanation, no markdown.`;

  try {
    const result = await generateText(prompt, { temperature: 0.6 });
    return stripCodeFences(result).replace(/^"|"$/g, "").trim();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Couldn't update this field right now. Please try again.");
  }
}
