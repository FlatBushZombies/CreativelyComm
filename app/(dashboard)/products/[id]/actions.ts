"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { addOptimizedImage, getProductById } from "@/lib/products";
import { uploadOptimizedImage } from "@/lib/storage";
import { removeBackground } from "@/lib/remove-bg";
import { logActivity } from "@/lib/activity";
import { translateProduct, deleteTranslation, type ProductTranslation } from "@/lib/translations";

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
