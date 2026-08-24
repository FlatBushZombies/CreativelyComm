/**
 * Creative intents a generated asset can serve. A Pinterest pin and a
 * product-page image aren't just different dimensions -- they have
 * different purposes, which is what this config (not just the platform
 * size) drives in the generation step.
 */
export type CreativeTypeId = "product" | "lifestyle" | "promotion" | "social" | "ad" | "product_page";

export interface CreativeTypeSpec {
  id: CreativeTypeId;
  label: string;
  description: string;
  allowsTextOverlay: boolean;
  /** Routes generation through the AI background-replacement path (components/products/background-composer.tsx's compositing approach) instead of a plain crop. */
  usesAIBackground: boolean;
}

export const CREATIVE_TYPES: CreativeTypeSpec[] = [
  {
    id: "product",
    label: "Product",
    description: "Clean, product-focused imagery. No text.",
    allowsTextOverlay: false,
    usesAIBackground: false,
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    description: "Product placed in an AI-generated lifestyle scene.",
    allowsTextOverlay: false,
    usesAIBackground: true,
  },
  {
    id: "promotion",
    label: "Promotion",
    description: "Product plus promotional messaging (headline, price, CTA).",
    allowsTextOverlay: true,
    usesAIBackground: false,
  },
  {
    id: "social",
    label: "Social",
    description: "Social-media-ready crop, with an optional short caption.",
    allowsTextOverlay: true,
    usesAIBackground: false,
  },
  {
    id: "ad",
    label: "Ad",
    description: "Conversion-oriented, with a headline and CTA.",
    allowsTextOverlay: true,
    usesAIBackground: false,
  },
  {
    id: "product_page",
    label: "Product page",
    description: "Clean ecommerce imagery sized for a product page.",
    allowsTextOverlay: false,
    usesAIBackground: false,
  },
];

export function getCreativeTypeSpec(id: CreativeTypeId): CreativeTypeSpec {
  return CREATIVE_TYPES.find((c) => c.id === id)!;
}
