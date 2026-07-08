import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "product-images";
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per image
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Uploads product images to the public `product-images` Storage bucket under
 * `workspaceId/uploadId/filename`, returning their public URLs in the same
 * order as the input files. Silently skips entries that aren't real files
 * (e.g. an empty file input) rather than throwing, since the surrounding
 * form always includes an `images` field even when nothing was selected.
 */
export async function uploadProductImages(
  workspaceId: string,
  files: File[]
): Promise<string[]> {
  const supabase = getSupabaseServerClient();
  const uploadId = crypto.randomUUID();
  const urls: string[] = [];

  for (const [index, file] of files.entries()) {
    if (!file || file.size === 0) continue;

    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error(`Unsupported image type: ${file.type || "unknown"}`);
    }
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(`${file.name} is larger than 8MB`);
    }

    const extension = file.name.split(".").pop() || "jpg";
    const path = `${workspaceId}/${uploadId}/${index}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

/**
 * Uploads a processed image (e.g. a Remove.bg result) to the same bucket
 * under `workspaceId/optimized/`, returning its public URL.
 */
export async function uploadOptimizedImage(
  workspaceId: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseServerClient();
  const extension = contentType.split("/")[1] || "png";
  const path = `${workspaceId}/optimized/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false });

  if (error) {
    throw new Error(`Failed to upload optimized image: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
