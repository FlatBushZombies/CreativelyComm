import { notFound } from "next/navigation";
import { getProductById } from "@/lib/mock-data";
import { ProductDetailsClient } from "./product-details-client";

interface ProductDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}
