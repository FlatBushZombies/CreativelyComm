"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import {
  createProduct,
  createProducts,
  bulkUpdateProducts,
  type CreateProductInput,
  type BulkProductUpdate,
} from "@/lib/products";
import { uploadProductImages } from "@/lib/storage";
import { logActivity } from "@/lib/activity";
import { parseProductsCsv } from "@/lib/import/parse";

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

  await logActivity(workspace.id, {
    type: "upload",
    title: "New product added",
    description: `${name} was added to your product library`,
    productName: name,
  });

  revalidatePath("/products");
  return {};
}

export interface ImportProductsState {
  error?: string;
  imported?: number;
  rowErrors?: string[];
}

export async function importProductsAction(
  _formData: FormData
): Promise<ImportProductsState> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const file = _formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a CSV file." };
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const text = await file.text();
  const { rows, errors: rowErrors } = parseProductsCsv(text);

  if (rows.length === 0) {
    return { error: "No valid rows found in that CSV.", rowErrors };
  }

  const inputs: CreateProductInput[] = rows.map((row) => ({
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    sku: row.sku,
    tags: row.tags,
    images: row.imageUrl ? [row.imageUrl] : [],
  }));

  try {
    await createProducts(workspace.id, inputs);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to import products.", rowErrors };
  }

  await logActivity(workspace.id, {
    type: "import",
    title: "CSV import completed",
    description: `${rows.length} product${rows.length === 1 ? "" : "s"} imported from CSV`,
  });

  revalidatePath("/products");
  return { imported: rows.length, rowErrors };
}

export interface BulkUpdateState {
  error?: string;
  updated?: number;
}

export async function bulkUpdateProductsAction(
  updates: BulkProductUpdate[]
): Promise<BulkUpdateState> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  if (updates.length === 0) {
    return { updated: 0 };
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  let updatedCount = 0;
  try {
    const result = await bulkUpdateProducts(workspace.id, updates);
    updatedCount = result.length;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to save changes." };
  }

  await logActivity(workspace.id, {
    type: "upload",
    title: "Bulk edit completed",
    description: `${updatedCount} product${updatedCount === 1 ? "" : "s"} updated`,
  });

  revalidatePath("/products");
  return { updated: updatedCount };
}
