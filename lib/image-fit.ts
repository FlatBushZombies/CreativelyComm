"use client";

/**
 * Client-only Canvas helpers for fitting an existing product photo into a
 * platform's recommended crop, entirely in the browser -- no server round
 * trip, no new dependency. Product images are hosted on Supabase Storage
 * (a different origin), so images are loaded with crossOrigin="anonymous";
 * this only works because Supabase's public buckets serve permissive CORS
 * headers by default. If a host doesn't, the canvas is "tainted" and
 * toBlob() throws -- callers should catch that and show a plain error
 * rather than crash.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't load this image."));
    img.src = src;
  });
}

export interface CoverOptions {
  /** 0-1 pan position within the croppable axis. 0.5 = centered. */
  offsetX?: number;
  offsetY?: number;
}

/** Which axis (if any) has slack to pan along once the image is scaled to cover the target box. */
export function croppableAxis(
  img: HTMLImageElement,
  targetW: number,
  targetH: number
): "x" | "y" | null {
  const targetRatio = targetW / targetH;
  const srcRatio = img.naturalWidth / img.naturalHeight;
  if (Math.abs(srcRatio - targetRatio) < 0.01) return null;
  return srcRatio > targetRatio ? "x" : "y";
}

/** Draws `img` into a targetW x targetH canvas using cover-fit (same behavior as CSS object-fit: cover), croppable along whichever axis has slack. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  options: CoverOptions = {}
) {
  const { offsetX = 0.5, offsetY = 0.5 } = options;
  const targetRatio = targetW / targetH;
  const srcRatio = img.naturalWidth / img.naturalHeight;

  let sx: number, sy: number, sw: number, sh: number;
  if (srcRatio > targetRatio) {
    sh = img.naturalHeight;
    sw = sh * targetRatio;
    sx = (img.naturalWidth - sw) * offsetX;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / targetRatio;
    sx = 0;
    sy = (img.naturalHeight - sh) * offsetY;
  }

  ctx.clearRect(0, 0, targetW, targetH);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
}

/** Draws a semi-transparent banner with wrapped, centered bold text -- used for Pinterest-style text-on-image overlays. */
export function drawTextBanner(
  ctx: CanvasRenderingContext2D,
  text: string,
  targetW: number,
  targetH: number,
  position: "top" | "bottom"
) {
  if (!text.trim()) return;

  const bannerHeight = Math.round(targetH * 0.22);
  const y = position === "top" ? 0 : targetH - bannerHeight;

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, y, targetW, bannerHeight);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.round(targetW * 0.075)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const words = text.trim().split(/\s+/);
  const maxWidth = targetW * 0.85;
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const shown = lines.slice(0, 3);
  const lineHeight = targetW * 0.09;
  const startY = y + bannerHeight / 2 - ((shown.length - 1) * lineHeight) / 2;
  shown.forEach((l, i) => ctx.fillText(l, targetW / 2, startY + i * lineHeight));
}

/** Exports a canvas as a downloaded JPEG via a blob URL -- a real browser download, no server involved. */
export function canvasToDownload(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Couldn't generate the image."));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        resolve();
      },
      "image/jpeg",
      0.92
    );
  });
}

export function slugifyFilename(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "product";
}
