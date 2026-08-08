"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace, type Workspace } from "@/lib/workspace";
import { getMemberRole } from "@/lib/team";
import { uploadHardwarePhoto } from "@/lib/storage";
import { attachCaptureShotsToProduct } from "@/lib/products";
import {
  type HardwareFeature,
  type ScanAction,
  setHardwareEnabled,
  saveHardwareConfig,
  logCaptureShot,
  logScanEvent,
  logQCPhoto,
  createContentKitRequest,
} from "@/lib/hardware";

async function requireSession() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  return { session, workspace };
}

async function requireManagerRole(): Promise<Workspace> {
  const { session, workspace } = await requireSession();
  const role = await getMemberRole(workspace.id, session.user.id);

  if (role !== "owner" && role !== "admin") {
    throw new Error("Only workspace owners and admins can manage hardware settings.");
  }

  return workspace;
}

export async function setHardwareEnabledAction(feature: HardwareFeature, enabled: boolean): Promise<void> {
  const workspace = await requireManagerRole();
  await setHardwareEnabled(workspace.id, feature, enabled);
  revalidatePath("/hardware");
}

export async function saveHardwareConfigAction(
  feature: HardwareFeature,
  config: Record<string, unknown>
): Promise<void> {
  const workspace = await requireManagerRole();
  await saveHardwareConfig(workspace.id, feature, config);
  revalidatePath("/hardware");
}

export interface UploadCaptureShotState {
  error?: string;
  imageUrl?: string;
}

/** Uploads one shot from a Capture Dock session (real getUserMedia capture) and logs it. */
export async function uploadCaptureShotAction(formData: FormData): Promise<UploadCaptureShotState> {
  const { workspace } = await requireSession();
  const file = formData.get("photo");
  if (!(file instanceof File)) {
    return { error: "No photo captured." };
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const productId = String(formData.get("productId") ?? "") || undefined;
  const angleRaw = formData.get("angle");
  const angle = angleRaw ? Number(angleRaw) : undefined;

  if (!sessionId) {
    return { error: "Missing capture session." };
  }

  try {
    const imageUrl = await uploadHardwarePhoto(workspace.id, "capture-dock", file);
    await logCaptureShot(workspace.id, { productId, sessionId, imageUrl, angle });
    revalidatePath("/hardware");
    return { imageUrl };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save photo." };
  }
}

/** Appends a finished capture session's photos to a product's real image gallery. */
export async function attachCaptureShotsAction(
  productId: string,
  imageUrls: string[]
): Promise<{ error?: string }> {
  const { workspace } = await requireSession();
  if (imageUrls.length === 0) {
    return { error: "No photos to attach." };
  }

  try {
    await attachCaptureShotsToProduct(productId, workspace.id, imageUrls);
    revalidatePath("/hardware");
    revalidatePath(`/products/${productId}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to attach photos." };
  }
}

export interface ScanActionResult {
  matched: boolean;
  stockUpdated: boolean;
  productName?: string;
  error?: string;
}

export async function logScanEventAction(barcode: string, action: ScanAction): Promise<ScanActionResult> {
  const { session, workspace } = await requireSession();
  const trimmed = barcode.trim();
  if (!trimmed) {
    return { matched: false, stockUpdated: false, error: "Empty barcode." };
  }

  try {
    const { matched, stockUpdated, event } = await logScanEvent(workspace.id, {
      barcode: trimmed,
      action,
      createdBy: session.user.id,
    });
    revalidatePath("/hardware");
    if (stockUpdated) revalidatePath("/products");
    return { matched, stockUpdated, productName: event.matchedProductName ?? undefined };
  } catch (err) {
    return { matched: false, stockUpdated: false, error: err instanceof Error ? err.message : "Failed to log scan." };
  }
}

export interface UploadQCPhotoState {
  error?: string;
}

/** Uploads a real pack-verification photo tied to a specific order. */
export async function uploadQCPhotoAction(formData: FormData): Promise<UploadQCPhotoState> {
  const { workspace } = await requireSession();
  const file = formData.get("photo");
  const orderId = String(formData.get("orderId") ?? "");

  if (!(file instanceof File)) {
    return { error: "No photo captured." };
  }
  if (!orderId) {
    return { error: "Select an order first." };
  }

  try {
    const imageUrl = await uploadHardwarePhoto(workspace.id, "qc-camera", file);
    await logQCPhoto(workspace.id, { orderId, imageUrl });
    revalidatePath("/hardware");
    revalidatePath(`/orders/${orderId}`);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save photo." };
  }
}

export interface RequestContentKitState {
  error?: string;
}

export async function requestContentKitAction(formData: FormData): Promise<RequestContentKitState> {
  const { session, workspace } = await requireSession();
  const shippingAddress = String(formData.get("shippingAddress") ?? "").trim();

  if (!shippingAddress) {
    return { error: "Enter a shipping address." };
  }

  await createContentKitRequest(workspace.id, { requestedBy: session.user.id, shippingAddress });
  revalidatePath("/hardware");
  return {};
}
