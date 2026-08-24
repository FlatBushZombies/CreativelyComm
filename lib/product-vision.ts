"use client";

/**
 * Real AI vision analysis of a product photo via Puter.js's chat() vision
 * input (confirmed against Puter's own docs: puter.ai.chat(prompt, imageUrl,
 * options) supports image analysis with vision-capable models). This is
 * advisory metadata only -- it informs which image looks best-suited to
 * which crop and gives the user a short human-readable insight, but the
 * actual crop math stays fully deterministic (lib/smart-crop.ts). Puter has
 * no segmentation/bounding-box endpoint, so we don't pretend this gives
 * pixel coordinates.
 */
export interface ProductVisionInsight {
  subjectDescription: string;
  isLifestylePhoto: boolean;
  dominantColors: string[];
  suitableForSquareCrop: boolean;
  suitableForTallCrop: boolean;
  notes: string;
}

interface PuterVisionGlobal {
  ai: {
    chat: (
      prompt: string,
      imageUrl: string,
      options?: { model?: string }
    ) => Promise<string | { message?: { content?: string } }>;
  };
}

function getPuter(): PuterVisionGlobal | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { puter?: PuterVisionGlobal }).puter ?? null;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

export async function analyzeProductImage(imageUrl: string): Promise<ProductVisionInsight> {
  const puter = getPuter();
  if (!puter) {
    throw new Error("AI analysis isn't ready yet — refresh the page and try again.");
  }

  const prompt = `Look at this product photo. Respond with ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:
{
  "subjectDescription": "one short sentence describing the product and how it's shot",
  "isLifestylePhoto": boolean, // true if it's shown in a styled scene/context rather than a plain/clean shot
  "dominantColors": ["..."], // 2-4 dominant color names, e.g. "warm beige"
  "suitableForSquareCrop": boolean, // true if the product would still read clearly cropped to a tight square
  "suitableForTallCrop": boolean, // true if there's enough vertical room/negative space for a tall (2:3 or taller) crop without cutting the product off
  "notes": "one short sentence of practical advice for cropping this specific photo"
}`;

  let raw: string | { message?: { content?: string } };
  try {
    raw = await puter.ai.chat(prompt, imageUrl, { model: "gpt-5.6-luna" });
  } catch {
    throw new Error("We couldn't analyze this photo right now. Please try again.");
  }

  const text = typeof raw === "string" ? raw : raw?.message?.content;
  if (!text || !text.trim()) {
    throw new Error("The AI didn't return an analysis. Please try again.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(text));
  } catch {
    throw new Error("We couldn't read the AI's analysis. Please try again.");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("We couldn't read the AI's analysis. Please try again.");
  }

  const p = parsed as Record<string, unknown>;
  return {
    subjectDescription: typeof p.subjectDescription === "string" ? p.subjectDescription : "",
    isLifestylePhoto: Boolean(p.isLifestylePhoto),
    dominantColors: Array.isArray(p.dominantColors) ? p.dominantColors.filter((c): c is string => typeof c === "string") : [],
    suitableForSquareCrop: p.suitableForSquareCrop !== false,
    suitableForTallCrop: p.suitableForTallCrop !== false,
    notes: typeof p.notes === "string" ? p.notes : "",
  };
}
