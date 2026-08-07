/**
 * Hardware features for CreativelyComm physical product capture and fulfillment
 * Generates proprietary data to strengthen the AI model over time
 */

// 1. Capture Dock — Turntable + Ring Light Photo Booth
export interface CaptureDock {
  id: string;
  name: string;
  enabled: boolean;
  serialNumber?: string;
  bluetoothPaired: boolean;
  lastSync?: Date;
  angleCount: number; // Multi-angle shots automation
  ringLightIntensity: number; // 0-100
  turntableRotationStep: number; // degrees
  autoFireDelay: number; // milliseconds between shots
  lastCaptureSession?: Date;
  capturedMetadata: CaptureMetadata[];
}

export interface CaptureMetadata {
  shotId: string;
  angle: number;
  lightingProfile: string;
  timestamp: Date;
  sku?: string;
}

// 2. Scan Station — Barcode Scanner + Receipt Printer
export interface ScanStation {
  id: string;
  name: string;
  enabled: boolean;
  serialNumber?: string;
  bluetoothPaired: boolean;
  lastSync?: Date;
  scannerType: "1D" | "2D";
  printerConnected: boolean;
  autoMatchSKU: boolean;
  flagMissingFields: boolean;
  metaConversionsApiEnabled: boolean;
  restockAlertThreshold: number; // percentage
  lastScanTime?: Date;
  scanLog: ScanRecord[];
}

export interface ScanRecord {
  scanId: string;
  barcode: string;
  sku: string;
  timestamp: Date;
  action: "intake" | "restock" | "verification";
  missingFields: string[];
  metaEventFired?: boolean;
}

// 3. Pack-and-Ship QC Camera
export interface PackShipQCCamera {
  id: string;
  name: string;
  enabled: boolean;
  location: string; // "packing-station" | custom
  fixed: boolean;
  lastSync?: Date;
  autoCapture: boolean;
  captureOnTrigger: boolean;
  verifyAgainstListing: boolean;
  timestampProof: boolean;
  anonymizeData: boolean;
  qcPhotos: QCPhotoRecord[];
  verifiedFulfillmentScore?: number;
}

export interface QCPhotoRecord {
  photoId: string;
  orderId: string;
  sku: string;
  timestamp: Date;
  matchesListing: boolean | null;
  conditionScore: number; // 0-100
  disputeDiscount: number; // calculated defense value
  anonymized: boolean;
}

// 4. Countertop POS Reader (Square-style)
export interface CountertopPOSReader {
  id: string;
  name: string;
  enabled: boolean;
  serialNumber?: string;
  cardReaderConnected: boolean;
  lastSync?: Date;
  paymentProcessor: "stripe" | "square" | "paypal"; // payment gateway
  omniChannelSyncEnabled: boolean;
  instantInventorySync: boolean;
  buyerRetargetingEnabled: boolean;
  metaCustomAudienceId?: string;
  lastTransactionTime?: Date;
  transactions: OnlineSaleRecord[];
}

export interface OnlineSaleRecord {
  saleId: string;
  timestamp: Date;
  amount: number;
  currency: string;
  buyerId?: string;
  buyerEmail?: string;
  channelsInventorySynced: string[]; // which channels this sale synced to
  addedToMetaAudience: boolean;
  conversionEventFired?: boolean;
}

// 5. Loss-leader Content Kit (Ring Light + Backdrop + Phone Mount)
export interface ContentKit {
  id: string;
  name: string;
  enabled: boolean;
  variantSku: string;
  costOfGoodsUSD: number;
  shippingCostUSD: number;
  freeShipToNewSignups: boolean;
  onboardingActivationTracker: boolean;
  lastDistributionDate?: Date;
  kitsShipped: ContentKitShipment[];
  activationMetrics?: ContentKitMetrics;
}

export interface ContentKitShipment {
  shipmentId: string;
  userId: string;
  shipDate: Date;
  estimatedArrival?: Date;
  unboxedDate?: Date;
  photoUploadedDate?: Date;
  firstListingCreated?: Date;
}

export interface ContentKitMetrics {
  kitsShipped: number;
  unboxRate: number; // %
  photoUploadRate: number; // %
  activationRate: number; // % who created first listing
  cpl: number; // cost per activated customer
}

// Hardware Product Summary
export type HardwareFeature =
  | "capture-dock"
  | "scan-station"
  | "qc-camera"
  | "pos-reader"
  | "content-kit";

export interface HardwareProduct {
  id: string;
  feature: HardwareFeature;
  enabled: boolean;
  linkedToWorkspace: boolean;
  lastUpdated: Date;
}

export const HARDWARE_FEATURES = [
  {
    id: "capture-dock",
    name: "Capture Dock",
    subtitle: "Turntable + Ring Light Photo Booth",
    description:
      "Auto-fires multi-angle shots straight into your workspace. Proprietary capture metadata strengthens bg-removal over time.",
    moat: "Capture metadata compounds AI model defensibility",
    costOfGoodsUSD: 300,
    difficulty: "hard",
    priority: 1,
  },
  {
    id: "scan-station",
    name: "Scan Station",
    subtitle: "Barcode Scanner + Receipt Printer",
    description:
      "Scans at intake auto-match/create SKU, flags missing fields live, fires Meta Conversions API events on restock.",
    moat: "System of record at point of physical handling",
    costOfGoodsUSD: 150,
    difficulty: "medium",
    priority: 2,
  },
  {
    id: "qc-camera",
    name: "Pack-and-Ship QC Camera",
    subtitle: "Fixed station camera for fulfillment verification",
    description:
      "Photographs outgoing items pre-ship, verifies listing match, timestamps proof-of-condition. Aggregated signal becomes trust badge.",
    moat: "Insurance-like layer with high switching cost",
    costOfGoodsUSD: 200,
    difficulty: "medium",
    priority: 3,
  },
  {
    id: "pos-reader",
    name: "Countertop POS Reader",
    subtitle: "Card Reader + Omni-channel Sync",
    description:
      "In-person sales syncs inventory across all channels instantly, pushes buyers to Meta Custom Audience for online retargeting.",
    moat: "Payments + omni-channel inventory lock-in",
    costOfGoodsUSD: 120,
    difficulty: "hard",
    priority: 4,
  },
  {
    id: "content-kit",
    name: "Loss-Leader Content Kit",
    subtitle: "Ring Light + Backdrop + Phone Mount",
    description:
      "Free to new paid signups. Cheap ($15-25 COGS), removes activation friction. Fastest to test, weakest moat.",
    moat: "Activation lever, not defensible",
    costOfGoodsUSD: 20,
    difficulty: "easy",
    priority: 5,
  },
];

export function getHardwareFeatureConfig(featureId: HardwareFeature) {
  return HARDWARE_FEATURES.find((f) => f.id === featureId);
}

export function getHardwareFeaturesByDifficulty(
  difficulty: "easy" | "medium" | "hard"
) {
  return HARDWARE_FEATURES.filter((f) => f.difficulty === difficulty);
}
