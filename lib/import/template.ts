export const PRODUCT_IMPORT_COLUMNS = [
  "name",
  "description",
  "price",
  "category",
  "sku",
  "tags",
  "image_url",
] as const;

export function generateTemplateCsv(): string {
  const header = PRODUCT_IMPORT_COLUMNS.join(",");
  const example =
    "Artisan Ceramic Mug,Handcrafted ceramic mug with a matte glaze finish,34.99,Home & Kitchen,ACM-001,\"ceramic, handmade\",https://example.com/mug.jpg";
  return `${header}\n${example}\n`;
}
