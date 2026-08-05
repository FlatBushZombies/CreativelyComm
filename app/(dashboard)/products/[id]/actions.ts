"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { addOptimizedImage, getProductById, updateProduct } from "@/lib/products";
import { uploadOptimizedImage } from "@/lib/storage";
import { removeBackground } from "@/lib/remove-bg";
import { logActivity } from "@/lib/activity";
import { translateProduct, deleteTranslation, type ProductTranslation } from "@/lib/translations";
import { adjustStock, type StockAdjustmentReason } from "@/lib/inventory";

export interface RemoveBackgroundResult {
  error?: string;
  optimizedImageUrl?: string;
}

export async function removeBackgroundAction(
  productId: string,
  imageUrl: string
): Promise<RemoveBackgroundResult> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  try {
    const { buffer, contentType } = await removeBackground(imageUrl);
    const optimizedUrl = await uploadOptimizedImage(workspace.id, buffer, contentType);
    const product = await addOptimizedImage(productId, workspace.id, optimizedUrl);

    await logActivity(workspace.id, {
      type: "optimize",
      title: "Background removed",
      description: `An image for ${product.name} was optimized with Remove.bg`,
      productName: product.name,
    });

    revalidatePath(`/products/${productId}`);
    return { optimizedImageUrl: optimizedUrl };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to remove background." };
  }
}

export interface TranslateProductResult {
  error?: string;
  translation?: ProductTranslation;
}

export async function translateProductAction(
  productId: string,
  locale: string
): Promise<TranslateProductResult> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const product = await getProductById(productId, workspace.id);
  if (!product) {
    return { error: "Product not found." };
  }

  try {
    const translation = await translateProduct(product, workspace.id, locale);
    await logActivity(workspace.id, {
      type: "publish",
      title: "Product translated",
      description: `${product.name} was translated to ${locale}`,
      productName: product.name,
    });
    revalidatePath(`/products/${productId}`);
    return { translation };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to translate product." };
  }
}

export async function deleteTranslationAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const translationId = String(formData.get("translationId") ?? "");
  const productId = String(formData.get("productId") ?? "");
  if (!translationId) return;

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  await deleteTranslation(translationId, workspace.id);
  revalidatePath(`/products/${productId}`);
}

export interface AdjustStockState {
  error?: string;
}

export async function adjustStockAction(formData: FormData): Promise<AdjustStockState> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const productId = String(formData.get("productId") ?? "");
  const delta = Number(formData.get("delta") ?? 0);
  const reason = String(formData.get("reason") ?? "") as StockAdjustmentReason;
  const note = String(formData.get("note") ?? "").trim() || undefined;

  if (!productId || !delta || !reason) {
    return { error: "A quantity and reason are required." };
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  try {
    await adjustStock(productId, workspace.id, { delta, reason, note, createdBy: session.user.id });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to adjust stock." };
  }

  revalidatePath(`/products/${productId}`);
  return {};
}

export async function assignVendorAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const productId = String(formData.get("productId") ?? "");
  const vendorId = String(formData.get("vendorId") ?? "");
  if (!productId) return;

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  await updateProduct(productId, workspace.id, { vendorId: vendorId || null });
  revalidatePath(`/products/${productId}`);
}

export interface UpdateSeoState {
  error?: string;
}

export async function updateSeoAction(formData: FormData): Promise<UpdateSeoState> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const productId = String(formData.get("productId") ?? "");
  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  try {
    await updateProduct(productId, workspace.id, {
      metaTitle: String(formData.get("metaTitle") ?? "").trim() || null,
      metaDescription: String(formData.get("metaDescription") ?? "").trim() || null,
      slug: String(formData.get("slug") ?? "").trim() || null,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save SEO settings." };
  }

  revalidatePath(`/products/${productId}`);
  return {};
}
