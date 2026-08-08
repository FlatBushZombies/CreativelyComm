/**
 * Client-safe hardware catalog (no "server-only" import) -- the static
 * feature list and shared types, split out from lib/hardware.ts so client
 * components can import them without pulling in server-only data-fetching
 * code. lib/hardware.ts re-exports these for existing server-side callers.
 */
export type HardwareFeature =
  | "capture-dock"
  | "scan-station"
  | "qc-camera"
  | "quick-sale"
  | "content-kit";

export interface HardwareFeatureInfo {
  id: HardwareFeature;
  name: string;
  subtitle: string;
  description: string;
}

export const HARDWARE_FEATURES: HardwareFeatureInfo[] = [
  {
    id: "capture-dock",
    name: "Multi-Angle Capture",
    subtitle: "Guided photo sessions with your phone or webcam",
    description:
      "Walk through a guided multi-shot session using your device's camera. Rotate the product between shots, optionally use your screen as a fill light, then attach the results straight to a product's photo gallery.",
  },
  {
    id: "scan-station",
    name: "Scan Station",
    subtitle: "Barcode intake with any USB or Bluetooth scanner",
    description:
      "Focus the scan field and scan — works with any standard barcode scanner (they type like a keyboard) or your device's camera. Matches against your catalog by SKU and logs every scan.",
  },
  {
    id: "qc-camera",
    name: "Pack Verification",
    subtitle: "Photograph orders before they ship",
    description:
      "Take a quick photo of an order before it ships, using your camera. Creates a timestamped record attached to that order — useful evidence if a buyer disputes an item's condition.",
  },
  {
    id: "quick-sale",
    name: "Quick Sale",
    subtitle: "Fast, barcode-first in-person checkout",
    description:
      "Scan items to build an order and record the sale on the spot. Same order flow and stock deduction as New Order, tuned for standing at a table or counter. Payment method is recorded, not processed.",
  },
  {
    id: "content-kit",
    name: "Content Kit",
    subtitle: "Ring light + backdrop + phone mount",
    description:
      "Request a physical starter kit for better product photos at home, then track the status of your request.",
  },
];

export function getHardwareFeatureInfo(feature: HardwareFeature): HardwareFeatureInfo {
  return HARDWARE_FEATURES.find((f) => f.id === feature)!;
}

export interface HardwareSetting {
  feature: HardwareFeature;
  enabled: boolean;
  config: Record<string, unknown>;
  updatedAt: string | null;
}
