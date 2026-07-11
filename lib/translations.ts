import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { translateText } from "@/lib/translate";
import type { Product } from "@/lib/products";

export interface ProductTranslation {
  id: string;
  locale: string;
  name: string;
  description: string;
  updatedAt: string;
}

interface ProductTranslationRow {
  id: string;
  locale: string;
  name: string;
  description: string;
  updated_at: string;
}

function mapRow(row: ProductTranslationRow): ProductTranslation {
  return {
    id: row.id,
    locale: row.locale,
    name: row.name,
    description: row.description,
    updatedAt: row.updated_at,
  };
}

export async function getProductTranslations(
  productId: string,
  workspaceId: string
): Promise<ProductTranslation[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_translations")
    .select("id, locale, name, description, updated_at")
    .eq("product_id", productId)
    .eq("workspace_id", workspaceId)
    .order("locale");

  if (error) {
    throw new Error(`Failed to load translations: ${error.message}`);
  }

  return (data as ProductTranslationRow[]).map(mapRow);
}

/** Public lookup, no workspace check needed -- called from the public product page. */
export async function getProductTranslation(
  productId: string,
  locale: string
): Promise<ProductTranslation | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_translations")
    .select("id, locale, name, description, updated_at")
    .eq("product_id", productId)
    .eq("locale", locale)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load translation: ${error.message}`);
  }

  return data ? mapRow(data as ProductTranslationRow) : null;
}

export async function translateProduct(
  product: Product,
  workspaceId: string,
  locale: string
): Promise<ProductTranslation> {
  const supabase = getSupabaseServerClient();
  const [translatedName, translatedDescription] = await translateText(
    [product.name, product.description || ""],
    locale
  );

  const { data, error } = await supabase
    .from("product_translations")
    .upsert(
      {
        product_id: product.id,
        workspace_id: workspaceId,
        locale,
        name: translatedName,
        description: translatedDescription,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id,locale" }
    )
    .select("id, locale, name, description, updated_at")
    .single();

  if (error || !data) {
    throw new Error(`Failed to save translation: ${error?.message}`);
  }

  return mapRow(data as ProductTranslationRow);
}

export async function deleteTranslation(id: string, workspaceId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("product_translations")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to delete translation: ${error.message}`);
  }
}
