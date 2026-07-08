import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ProductStatus = "draft" | "pending" | "optimized" | "published";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  images: string[];
  optimizedImages: string[];
  sku: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  exports: number;
}

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number | string;
  category: string;
  status: ProductStatus;
  images: string[];
  optimized_images: string[];
  sku: string | null;
  tags: string[];
  views: number;
  exports: number;
  created_at: string;
  updated_at: string;
}

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    status: row.status,
    images: row.images ?? [],
    optimizedImages: row.optimized_images ?? [],
    sku: row.sku ?? "",
    tags: row.tags ?? [],
    views: row.views,
    exports: row.exports,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProducts(workspaceId: string): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  return (data as ProductRow[]).map(mapRow);
}

export async function getProductById(id: string, workspaceId: string): Promise<Product | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load product: ${error.message}`);
  }

  return data ? mapRow(data as ProductRow) : null;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  sku?: string;
  tags?: string[];
  images?: string[];
}

export async function createProduct(
  workspaceId: string,
  input: CreateProductInput
): Promise<Product> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      description: input.description ?? "",
      price: input.price ?? 0,
      category: input.category ?? "",
      sku: input.sku ?? null,
      tags: input.tags ?? [],
      images: input.images ?? [],
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create product: ${error?.message}`);
  }

  return mapRow(data as ProductRow);
}

/**
 * Appends a processed image URL to a product's optimizedImages and marks it
 * "optimized". Scoped by workspaceId so a product can't be mutated across
 * workspaces.
 */
export async function addOptimizedImage(
  productId: string,
  workspaceId: string,
  imageUrl: string
): Promise<Product> {
  const supabase = getSupabaseServerClient();

  const existing = await getProductById(productId, workspaceId);
  if (!existing) {
    throw new Error("Product not found.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      optimized_images: [...existing.optimizedImages, imageUrl],
      status: "optimized",
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update product: ${error?.message}`);
  }

  return mapRow(data as ProductRow);
}
