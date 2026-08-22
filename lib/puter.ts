"use client";

/**
 * Thin wrapper around the Puter.js global (loaded via <Script> in
 * app/layout.tsx). Puter.js runs entirely client-side under a "user pays"
 * model: calling puter.ai.txt2img()/chat() prompts the current visitor to
 * log into their own free Puter account (a popup) the first time, and usage
 * is billed against THEIR Puter account, not ours -- no API key, no cost to
 * this app. See https://developer.puter.com.
 */
interface PuterGlobal {
  ai: {
    txt2img: (prompt: string, options?: { model?: string; quality?: "low" | "medium" | "high" }) => Promise<HTMLImageElement>;
    chat: (
      prompt: string,
      options?: { model?: string; temperature?: number; max_tokens?: number }
    ) => Promise<string | { message?: { content?: string } }>;
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
