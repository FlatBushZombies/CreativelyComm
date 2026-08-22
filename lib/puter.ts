"use client";

/**
 * Thin wrapper around the Puter.js global (loaded via <Script> in
 * app/layout.tsx). Puter.js runs entirely client-side under a "user pays"
 * model: calling puter.ai.txt2img() prompts the current visitor to log into
 * their own free Puter account (a popup) the first time, and image
 * generation is billed against THEIR Puter account, not ours -- no API key,
 * no cost to this app. See https://developer.puter.com.
 */
interface PuterGlobal {
  ai: {
    txt2img: (prompt: string, options?: { model?: string; quality?: "low" | "medium" | "high" }) => Promise<HTMLImageElement>;
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
