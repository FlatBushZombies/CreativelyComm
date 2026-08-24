"use client";

/**
 * Deterministic "intelligent cropping" -- no AI segmentation endpoint exists
 * in this app's provider (Puter.js), so this uses real pixel data instead:
 * a Remove.bg cutout's alpha channel IS the product's real boundary. This
 * feeds lib/image-fit.ts's existing drawCover() a smarter offset instead of
 * duplicating its crop math.
 */
export interface ProductBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Scans a (presumably transparent-background) image's alpha channel for the non-transparent bounding box. Returns null if nothing found or the canvas is tainted (cross-origin without permissive CORS) -- callers should fall back to a plain center crop in that case. */
export function computeProductBounds(img: HTMLImageElement, alphaThreshold = 10): ProductBounds | null {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx || canvas.width === 0 || canvas.height === 0) return null;

  ctx.drawImage(img, 0, 0);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch {
    return null;
  }

  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  // Sample on a grid rather than every pixel -- plenty accurate for a crop
  // centroid, much cheaper on large photos.
  const step = Math.max(1, Math.floor(Math.max(canvas.width, canvas.height) / 400));

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Converts a product bounding box into the 0-1 offsetX/offsetY pair
 * lib/image-fit.ts's drawCover() already accepts -- same math it uses
 * internally, solved for "center the crop window on the product" instead
 * of the default 0.5/0.5 image center.
 */
export function computeSmartOffset(
  bounds: ProductBounds,
  imgWidth: number,
  imgHeight: number,
  targetRatio: number
): { offsetX: number; offsetY: number } {
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  const srcRatio = imgWidth / imgHeight;
  let cropW: number;
  let cropH: number;
  if (srcRatio > targetRatio) {
    cropH = imgHeight;
    cropW = cropH * targetRatio;
  } else {
    cropW = imgWidth;
    cropH = cropW / targetRatio;
  }

  const maxOffsetX = imgWidth - cropW;
  const maxOffsetY = imgHeight - cropH;

  const offsetX = maxOffsetX > 0 ? clamp((centerX - cropW / 2) / maxOffsetX, 0, 1) : 0.5;
  const offsetY = maxOffsetY > 0 ? clamp((centerY - cropH / 2) / maxOffsetY, 0, 1) : 0.5;

  return { offsetX, offsetY };
}
