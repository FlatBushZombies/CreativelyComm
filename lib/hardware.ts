import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getProductBySku } from "@/lib/products";
import { adjustStock } from "@/lib/inventory";

/**
 * Hardware features are bring-your-own-device software workflows -- a
 * phone/webcam for capture, any USB/Bluetooth barcode scanner, any printer
 * -- not proprietary devices this product manufactures or ships. Every
 * function here is backed by a real table (scripts/sql/018_hardware.sql);
 * there is no fabricated device state.
 *
 * The static catalog and shared types live in lib/hardware-catalog.ts (no
 * "server-only") so client components can import them directly instead of
 * pulling in this server-only module.
 */
export {
  HARDWARE_FEATURES,
  getHardwareFeatureInfo,
  type HardwareFeature,
  type HardwareFeatureInfo,
  type HardwareSetting,
} from "@/lib/hardware-catalog";
import { HARDWARE_FEATURES, type HardwareFeature, type HardwareSetting } from "@/lib/hardware-catalog";

interface HardwareSettingRow {
  feature: HardwareFeature;
  enabled: boolean;
  config: Record<string, unknown>;
  updated_at: string;
}

/** Returns settings for all 5 features, defaulting disabled/empty-config for any that don't have a row yet. */
export async function getHardwareSettings(
  workspaceId: string
): Promise<Record<HardwareFeature, HardwareSetting>> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("hardware_settings")
    .select("feature, enabled, config, updated_at")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to load hardware settings: ${error.message}`);
  }

  const byFeature = new Map((data as HardwareSettingRow[]).map((row) => [row.feature, row]));

  return Object.fromEntries(
    HARDWARE_FEATURES.map(({ id }) => {
      const row = byFeature.get(id);
      return [
        id,
        row
          ? { feature: id, enabled: row.enabled, config: row.config, updatedAt: row.updated_at }
          : { feature: id, enabled: false, config: {}, updatedAt: null },
      ];
    })
  ) as Record<HardwareFeature, HardwareSetting>;
}

export async function setHardwareEnabled(
  workspaceId: string,
  feature: HardwareFeature,
  enabled: boolean
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("hardware_settings")
    .upsert(
      { workspace_id: workspaceId, feature, enabled, updated_at: new Date().toISOString() },
      { onConflict: "workspace_id,feature" }
    );

  if (error) {
    throw new Error(`Failed to update hardware setting: ${error.message}`);
  }
}

export async function saveHardwareConfig(
  workspaceId: string,
  feature: HardwareFeature,
  config: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("hardware_settings")
    .upsert(
      { workspace_id: workspaceId, feature, config, updated_at: new Date().toISOString() },
      { onConflict: "workspace_id,feature" }
    );

  if (error) {
    throw new Error(`Failed to save hardware config: ${error.message}`);
  }
}

// --- Capture Dock ---

export interface CaptureShot {
  id: string;
  productId: string | null;
  sessionId: string;
  imageUrl: string;
  angle: number | null;
  createdAt: string;
}

export async function logCaptureShot(
  workspaceId: string,
  input: { productId?: string | null; sessionId: string; imageUrl: string; angle?: number }
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("capture_shots").insert({
    workspace_id: workspaceId,
    product_id: input.productId ?? null,
    session_id: input.sessionId,
    image_url: input.imageUrl,
    angle: input.angle ?? null,
  });

  if (error) {
    throw new Error(`Failed to log capture shot: ${error.message}`);
  }
}

export async function getCaptureShots(workspaceId: string, limit = 20): Promise<CaptureShot[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("capture_shots")
    .select("id, product_id, session_id, image_url, angle, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load capture shots: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    sessionId: row.session_id,
    imageUrl: row.image_url,
    angle: row.angle,
    createdAt: row.created_at,
  }));
}

// --- Scan Station ---

export type ScanAction = "intake" | "restock" | "verification";

export interface ScanEvent {
  id: string;
  barcode: string;
  matchedProductId: string | null;
  matchedProductName: string | null;
  action: ScanAction;
  createdAt: string;
}

export interface LogScanResult {
  event: ScanEvent;
  matched: boolean;
  stockUpdated: boolean;
}

/**
 * Logs a scan and looks up a matching product by SKU in the same workspace.
 * A "restock" scan against a matched, inventory-tracked product also bumps
 * real stock by 1 unit via the existing stock-adjustment ledger (same
 * function orders/cancellations use) -- one scan, one unit restocked.
 */
export async function logScanEvent(
  workspaceId: string,
  input: { barcode: string; action: ScanAction; createdBy?: string }
): Promise<LogScanResult> {
  const supabase = getSupabaseServerClient();
  const product = await getProductBySku(input.barcode, workspaceId);

  let stockUpdated = false;
  if (product && input.action === "restock") {
    await adjustStock(product.id, workspaceId, {
      delta: 1,
      reason: "restock",
      createdBy: input.createdBy,
    });
    stockUpdated = true;
  }

  const { data, error } = await supabase
    .from("scan_events")
    .insert({
      workspace_id: workspaceId,
      barcode: input.barcode,
      matched_product_id: product?.id ?? null,
      action: input.action,
    })
    .select("id, barcode, matched_product_id, action, created_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to log scan: ${error?.message}`);
  }

  return {
    matched: Boolean(product),
    stockUpdated,
    event: {
      id: data.id,
      barcode: data.barcode,
      matchedProductId: data.matched_product_id,
      matchedProductName: product?.name ?? null,
      action: data.action,
      createdAt: data.created_at,
    },
  };
}

export async function getScanEvents(workspaceId: string, limit = 20): Promise<ScanEvent[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("scan_events")
    .select("id, barcode, matched_product_id, matched_product:matched_product_id(name), action, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load scan events: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const matchedProduct = row.matched_product as unknown as { name: string } | null;
    return {
      id: row.id as string,
      barcode: row.barcode as string,
      matchedProductId: row.matched_product_id as string | null,
      matchedProductName: matchedProduct?.name ?? null,
      action: row.action as ScanAction,
      createdAt: row.created_at as string,
    };
  });
}

// --- QC Camera ---

export interface QCPhoto {
  id: string;
  orderId: string;
  imageUrl: string;
  matchesListing: boolean | null;
  createdAt: string;
}

export async function logQCPhoto(
  workspaceId: string,
  input: { orderId: string; imageUrl: string; matchesListing?: boolean }
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("qc_photos").insert({
    workspace_id: workspaceId,
    order_id: input.orderId,
    image_url: input.imageUrl,
    matches_listing: input.matchesListing ?? null,
  });

  if (error) {
    throw new Error(`Failed to log QC photo: ${error.message}`);
  }
}

export async function getQCPhotos(workspaceId: string, orderId?: string, limit = 20): Promise<QCPhoto[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("qc_photos")
    .select("id, order_id, image_url, matches_listing, created_at")
    .eq("workspace_id", workspaceId);

  if (orderId) {
    query = query.eq("order_id", orderId);
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);

  if (error) {
    throw new Error(`Failed to load QC photos: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    orderId: row.order_id,
    imageUrl: row.image_url,
    matchesListing: row.matches_listing,
    createdAt: row.created_at,
  }));
}

// --- Content Kit ---

export type ContentKitStatus = "requested" | "shipped" | "delivered";

export interface ContentKitRequest {
  id: string;
  shippingAddress: string;
  status: ContentKitStatus;
  requestedAt: string;
}

export async function createContentKitRequest(
  workspaceId: string,
  input: { requestedBy: string; shippingAddress: string }
): Promise<ContentKitRequest> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_kit_requests")
    .insert({
      workspace_id: workspaceId,
      requested_by: input.requestedBy,
      shipping_address: input.shippingAddress,
    })
    .select("id, shipping_address, status, requested_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to request content kit: ${error?.message}`);
  }

  return {
    id: data.id,
    shippingAddress: data.shipping_address,
    status: data.status,
    requestedAt: data.requested_at,
  };
}

export async function getContentKitRequests(workspaceId: string): Promise<ContentKitRequest[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("content_kit_requests")
    .select("id, shipping_address, status, requested_at")
    .eq("workspace_id", workspaceId)
    .order("requested_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load content kit requests: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    shippingAddress: row.shipping_address,
    status: row.status,
    requestedAt: row.requested_at,
  }));
}
