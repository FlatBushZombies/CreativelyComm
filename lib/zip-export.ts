"use client";

import JSZip from "jszip";
import { getPlatformSpec } from "@/lib/platforms";
import { slugifyFilename } from "@/lib/image-fit";

export interface ExportableAsset {
  imageUrl: string;
  platformId: string;
  creativeType: string;
}

/** Fetches every completed asset, groups them into per-platform-category folders, and downloads one real .zip with meaningful filenames. */
export async function downloadContentPackZip(assets: ExportableAsset[], productName: string): Promise<void> {
  const zip = new JSZip();
  const baseName = slugifyFilename(productName);

  await Promise.all(
    assets.map(async (asset) => {
      const spec = getPlatformSpec(asset.platformId);
      const folder = spec?.category ?? "other";
      const response = await fetch(asset.imageUrl);
      if (!response.ok) return;
      const blob = await response.blob();
      const filename = `${folder}/${baseName}-${asset.platformId}-${asset.creativeType}.jpg`;
      zip.file(filename, blob);
    })
  );

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}-content-pack.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
