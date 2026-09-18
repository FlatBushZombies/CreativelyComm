"use client";

/**
 * Thin wrapper around the Puter.js global (loaded via <Script> in
 * app/layout.tsx). Puter.js runs entirely client-side under a "user pays"
 * model: calling puter.ai.txt2img()/chat() prompts the current visitor to
 * log into their own free Puter account (a popup) the first time, and usage
 * is billed against THEIR Puter account, not ours -- no API key, no cost to
 * this app. See https://developer.puter.com.
 */
interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  image_config?: Record<string, unknown>;
}

interface ChatResponseMessage {
  content?: string;
  /** Present when the model (e.g. Nano Banana / gemini-2.5-flash-image) generated or edited an image. */
  images?: { type: "image_url"; image_url: { url: string } }[];
}

interface PuterGlobal {
  ai: {
    txt2img: (prompt: string, options?: { model?: string; quality?: "low" | "medium" | "high" }) => Promise<HTMLImageElement>;
    chat: (
      prompt: string,
      imageOrOptions?: string | ChatOptions,
      options?: ChatOptions
    ) => Promise<string | { message?: ChatResponseMessage }>;
  };
}

function getPuter(): PuterGlobal | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { puter?: PuterGlobal }).puter ?? null;
}

export async function generateLifestyleBackground(prompt: string): Promise<HTMLImageElement> {
  const puter = getPuter();
  if (!puter) {
    throw new Error("AI image generation isn't ready yet — refresh the page and try again.");
  }
  return puter.ai.txt2img(prompt, { quality: "medium" });
}

/**
 * Real text generation via Puter.js -- returns the plain response text.
 * puter.ai.chat() has returned either a bare string or a chat-completion-
 * shaped object across versions/models, so both are handled here rather
 * than assuming one shape.
 */
export async function generateText(prompt: string, options?: { temperature?: number }): Promise<string> {
  const puter = getPuter();
  if (!puter) {
    throw new Error("AI generation isn't ready yet — refresh the page and try again.");
  }
  const result = await puter.ai.chat(prompt, { temperature: options?.temperature ?? 0.7 });
  const text = typeof result === "string" ? result : result?.message?.content;
  if (!text || !text.trim()) {
    throw new Error("The AI didn't return a response — try again.");
  }
  return text;
}

const NANO_BANANA_MODEL = "gemini-2.5-flash-image";

/**
 * Nano Banana (Gemini 2.5 Flash Image) via Puter.js -- same free, no-API-key
 * "user pays" infra as generateText/generateLifestyleBackground above, just
 * a model that returns images through chat() instead of plain text. Covers
 * both fresh generation (no inputImageUrl) and iterative editing/refining
 * (pass the previous result back in as inputImageUrl) with one function,
 * since Nano Banana's real feature is conversational image editing -- call
 * this again with its own output to "perfect" an image over several turns.
 */
export async function generateCampaignImage(prompt: string, inputImageUrl?: string): Promise<string> {
  const puter = getPuter();
  if (!puter) {
    throw new Error("AI image generation isn't ready yet — refresh the page and try again.");
  }

  const options: ChatOptions = { model: NANO_BANANA_MODEL };
  const result = inputImageUrl
    ? await puter.ai.chat(prompt, inputImageUrl, options)
    : await puter.ai.chat(prompt, options);

  const message = typeof result === "string" ? undefined : result?.message;
  const imageUrl = message?.images?.[0]?.image_url?.url;
  if (!imageUrl) {
    throw new Error("Nano Banana didn't return an image — try a different prompt.");
  }
  return imageUrl;
}
