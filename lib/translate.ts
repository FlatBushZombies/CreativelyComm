import "server-only";

// Real DeepL API integration. Contract verified against DeepL's official
// docs: POST https://api-free.deepl.com/v2/translate (free) or
// https://api.deepl.com/v2/translate (pro), header
// "Authorization: DeepL-Auth-Key <key>", body { text: string[], target_lang }.
// Free-tier keys conventionally end in ":fx" -- used to pick the endpoint.

export async function translateText(texts: string[], targetLang: string): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPL_API_KEY is not configured.");
  }

  const endpoint = apiKey.trim().endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: texts, target_lang: targetLang }),
  });

  if (!response.ok) {
    let message = `DeepL request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // response wasn't JSON; keep the generic status message
    }
    throw new Error(message);
  }

  const body = await response.json();
  return (body.translations as { text: string }[]).map((t) => t.text);
}
