"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { addOptimizedImage } from "@/lib/products";
import { uploadOptimizedImage } from "@/lib/storage";
import { removeBackground } from "@/lib/remove-bg";
import { logActivity } from "@/lib/activity";

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
