import "server-only";

const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";

export interface RemovedBackgroundImage {
  buffer: Buffer;
  contentType: string;
}

/**
 * Sends an existing image URL to the Remove.bg API and returns the
 * background-removed image bytes. Uses `image_url` (remove.bg fetches the
 * source itself) rather than downloading and re-uploading the file here.
 */
export async function removeBackground(imageUrl: string): Promise<RemovedBackgroundImage> {
  const apiKey = process.env.NEXT_REMOVE_BG_KEY;
  if (!apiKey) {
    throw new Error("NEXT_REMOVE_BG_KEY is not configured.");
  }

  const form = new FormData();
  form.append("image_url", imageUrl);
  form.append("size", "auto");

  const response = await fetch(REMOVE_BG_ENDPOINT, {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body: form,
  });

  if (!response.ok) {
    let message = `Remove.bg request failed (${response.status})`;
    try {
      const body = await response.json();
      const detail = body?.errors?.[0]?.title;
      if (detail) message = detail;
    } catch {
      // response wasn't JSON; keep the generic status message
    }
    throw new Error(message);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/png";

  return { buffer: Buffer.from(arrayBuffer), contentType };
}
