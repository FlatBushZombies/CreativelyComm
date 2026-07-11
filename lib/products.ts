import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { recordProductVersion } from "@/lib/versions";

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

  const product = mapRow(data as ProductRow);
  await recordProductVersion(workspaceId, product, "Product created");
  return product;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  sku?: string;
  tags?: string[];
  status?: ProductStatus;
}

/** Partial update for a single product, scoped to workspaceId. Used by the public API's PATCH endpoint. */
export async function updateProduct(
  id: string,
  workspaceId: string,
  input: UpdateProductInput
): Promise<Product | null> {
  const supabase = getSupabaseServerClient();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.price !== undefined) patch.price = input.price;
  if (input.category !== undefined) patch.category = input.category;
  if (input.sku !== undefined) patch.sku = input.sku;
  if (input.tags !== undefined) patch.tags = input.tags;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return data ? mapRow(data as ProductRow) : null;
}

/**
 * Bulk-inserts products in a single call (used by CSV import). Records a
 * version snapshot per product, same as the single-product createProduct.
 */
export async function createProducts(
  workspaceId: string,
  inputs: CreateProductInput[]
): Promise<Product[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert(
      inputs.map((input) => ({
        workspace_id: workspaceId,
        name: input.name,
        description: input.description ?? "",
        price: input.price ?? 0,
        category: input.category ?? "",
        sku: input.sku ?? null,
        tags: input.tags ?? [],
        images: input.images ?? [],
      }))
    )
    .select();

  if (error || !data) {
    throw new Error(`Failed to import products: ${error?.message}`);
  }

  const products = (data as ProductRow[]).map(mapRow);
  await Promise.all(
    products.map((product) => recordProductVersion(workspaceId, product, "Product created (CSV import)"))
  );
  return products;
}

/**
 * Increments the `exports` counter for a batch of products after a real
 * export file has been generated for them.
 */
export async function incrementProductExports(productIds: string[]): Promise<void> {
  const supabase = getSupabaseServerClient();
  for (const id of productIds) {
    const { data } = await supabase.from("products").select("exports").eq("id", id).maybeSingle();
    if (!data) continue;
    await supabase.from("products").update({ exports: data.exports + 1 }).eq("id", id);
  }
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

  const product = mapRow(data as ProductRow);
  await recordProductVersion(workspaceId, product, "Background removed from an image");
  return product;
}

export interface BulkProductUpdate {
  id: string;
  name: string;
  price: number;
  category: string;
  status: ProductStatus;
}

/**
 * Bulk-updates products in a single call (used by the products table's bulk
 * edit view). Filters to rows actually owned by workspaceId first, so a
 * forged id in the payload can't touch another workspace's product.
 */
export async function bulkUpdateProducts(
  workspaceId: string,
  updates: BulkProductUpdate[]
): Promise<Product[]> {
  const supabase = getSupabaseServerClient();

  const { data: owned, error: ownedError } = await supabase
    .from("products")
    .select("id")
    .eq("workspace_id", workspaceId)
    .in("id", updates.map((u) => u.id));

  if (ownedError) {
    throw new Error(`Failed to verify product ownership: ${ownedError.message}`);
  }

  const ownedIds = new Set((owned ?? []).map((row) => row.id as string));
  const safeUpdates = updates.filter((u) => ownedIds.has(u.id));

  if (safeUpdates.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .upsert(
      safeUpdates.map((u) => ({
        id: u.id,
        workspace_id: workspaceId,
        name: u.name,
        price: u.price,
        category: u.category,
        status: u.status,
        updated_at: new Date().toISOString(),
      }))
    )
    .select();

  if (error || !data) {
    throw new Error(`Failed to bulk update products: ${error?.message}`);
  }

  return (data as ProductRow[]).map(mapRow);
}

/**
 * Increments a product's view count. Called from the public storefront/
 * product pages so "Store Views" on the dashboard reflects real visits.
 */
export async function incrementProductViews(productId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("views")
    .eq("id", productId)
    .maybeSingle();

  if (!data) return;

  await supabase
    .from("products")
    .update({ views: data.views + 1 })
    .eq("id", productId);
}
