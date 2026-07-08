"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { createProduct } from "@/lib/products";
import { uploadProductImages } from "@/lib/storage";

export interface CreateProductState {
  error?: string;
}

export async function createProductAction(
  formData: FormData
): Promise<CreateProductState> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Product name is required." };
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  const files = formData.getAll("images").filter((entry): entry is File => entry instanceof File);

  let images: string[] = [];
  try {
    images = await uploadProductImages(workspace.id, files);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to upload images." };
  }

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  try {
    await createProduct(workspace.id, {
      name,
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price") ?? 0) || 0,
      category: String(formData.get("category") ?? ""),
      sku: String(formData.get("sku") ?? "") || undefined,
      tags,
      images,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create product." };
  }

  revalidatePath("/products");
  return {};
}
