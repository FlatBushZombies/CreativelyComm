import type { Product } from "@/lib/products";
import { toCsv, xmlEscape, slugify } from "./csv";

// These generators produce real, structurally-valid export files from real
// product data. Shopify's CSV columns and Google Merchant's XML/g: fields
// were verified against current official docs. The other five (WooCommerce,
// Etsy, Amazon, Facebook Catalog, TikTok Shop) use well-known, commonly
// documented conventions but are NOT freshly verified against each
// platform's current bulk-upload spec — treat them as a starting point to
// check against the platform's own template before a real upload. Amazon in
// particular uses a category-specific flat file in reality; this is a
// simplified generic subset, not Amazon's actual template.

export interface ExportFile {
  content: string;
  filename: string;
  contentType: string;
}

export interface ExportContext {
  storeUrl: string; // e.g. https://app.example.com/store/my-shop
}

const dateStamp = () => new Date().toISOString().slice(0, 10);

function productImage(p: Product): string {
  return p.optimizedImages[0] || p.images[0] || "";
}

function isListed(p: Product): boolean {
  return p.status === "published" || p.status === "optimized";
}

export function generateShopifyCsv(products: Product[]): ExportFile {
  const headers = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Type",
    "Tags",
    "Published",
    "Variant SKU",
    "Variant Price",
    "Image Src",
  ];
  const rows = products.map((p) => [
    slugify(p.name) || p.id,
    p.name,
    p.description,
    "",
    p.category,
    p.tags.join(", "),
    p.status === "published" ? "TRUE" : "FALSE",
    p.sku,
    p.price.toFixed(2),
    productImage(p),
  ]);
  return {
    content: toCsv(headers, rows),
    filename: `shopify-export-${dateStamp()}.csv`,
    contentType: "text/csv",
  };
}

export function generateWooCommerceCsv(products: Product[]): ExportFile {
  const headers = [
    "SKU",
    "Name",
    "Published",
    "Short description",
    "Description",
    "Regular price",
    "Categories",
    "Tags",
    "Images",
  ];
  const rows = products.map((p) => [
    p.sku,
    p.name,
    isListed(p) ? "1" : "0",
    p.description.slice(0, 160),
    p.description,
    p.price.toFixed(2),
    p.category,
    p.tags.join(", "),
    [productImage(p)].filter(Boolean).join(","),
  ]);
  return {
    content: toCsv(headers, rows),
    filename: `woocommerce-export-${dateStamp()}.csv`,
    contentType: "text/csv",
  };
}

export function generateEtsyCsv(products: Product[]): ExportFile {
  const headers = ["TITLE", "DESCRIPTION", "PRICE", "CURRENCY_CODE", "QUANTITY", "TAGS", "IMAGE1", "SKU"];
  const rows = products.map((p) => [
    p.name,
    p.description,
    p.price.toFixed(2),
    "USD",
    1,
    p.tags.slice(0, 13).join(","),
    productImage(p),
    p.sku,
  ]);
  return {
    content: toCsv(headers, rows),
    filename: `etsy-export-${dateStamp()}.csv`,
    contentType: "text/csv",
  };
}

export function generateAmazonFlatFile(products: Product[]): ExportFile {
  // Simplified generic subset — Amazon's real Seller Central flat file is
  // category-specific and must be downloaded from Seller Central per
  // category; this is a starting point, not a drop-in replacement.
  const headers = ["sku", "item-name", "item-description", "price", "quantity"];
  const rows = products.map((p) => [p.sku, p.name, p.description, p.price.toFixed(2), 1]);
  return {
    content: toCsv(headers, rows),
    filename: `amazon-export-${dateStamp()}.csv`,
    contentType: "text/csv",
  };
}

export function generateGoogleMerchantXml(products: Product[], context: ExportContext): ExportFile {
  const items = products
    .map((p) => {
      const link = `${context.storeUrl}/products/${p.id}`;
      return `    <item>
      <g:id>${xmlEscape(p.id)}</g:id>
      <g:title>${xmlEscape(p.name)}</g:title>
      <g:description>${xmlEscape(p.description)}</g:description>
      <g:link>${xmlEscape(link)}</g:link>
      <g:image_link>${xmlEscape(productImage(p))}</g:image_link>
      <g:price>${p.price.toFixed(2)} USD</g:price>
      <g:availability>${isListed(p) ? "in_stock" : "out_of_stock"}</g:availability>
      <g:condition>new</g:condition>
    </item>`;
    })
    .join("\n");

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Product Feed</title>
    <link>${xmlEscape(context.storeUrl)}</link>
    <description>Product feed for Google Shopping</description>
${items}
  </channel>
</rss>
`;

  return {
    content,
    filename: `google-merchant-export-${dateStamp()}.xml`,
    contentType: "application/xml",
  };
}

export function generateFacebookCatalogCsv(products: Product[], context: ExportContext): ExportFile {
  const headers = ["id", "title", "description", "availability", "condition", "price", "link", "image_link"];
  const rows = products.map((p) => [
    p.id,
    p.name,
    p.description,
    isListed(p) ? "in stock" : "out of stock",
    "new",
    `${p.price.toFixed(2)} USD`,
    `${context.storeUrl}/products/${p.id}`,
    productImage(p),
  ]);
  return {
    content: toCsv(headers, rows),
    filename: `facebook-catalog-export-${dateStamp()}.csv`,
    contentType: "text/csv",
  };
}

export function generateTiktokShopCsv(products: Product[]): ExportFile {
  const headers = ["product_name", "description", "price", "sku", "category", "image_url"];
  const rows = products.map((p) => [p.name, p.description, p.price.toFixed(2), p.sku, p.category, productImage(p)]);
  return {
    content: toCsv(headers, rows),
    filename: `tiktok-shop-export-${dateStamp()}.csv`,
    contentType: "text/csv",
  };
}

export const EXPORT_GENERATORS: Record<
  string,
  (products: Product[], context: ExportContext) => ExportFile
> = {
  shopify: generateShopifyCsv,
  woocommerce: generateWooCommerceCsv,
  etsy: generateEtsyCsv,
  amazon: generateAmazonFlatFile,
  google: generateGoogleMerchantXml,
  facebook: generateFacebookCatalogCsv,
  tiktok: generateTiktokShopCsv,
};
