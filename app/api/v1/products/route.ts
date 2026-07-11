import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getProducts, createProduct } from "@/lib/products";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await getProducts(auth.workspaceId);
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "\"name\" is required" }, { status: 400 });
  }

  const product = await createProduct(auth.workspaceId, {
    name: body.name,
    description: typeof body.description === "string" ? body.description : undefined,
    price: typeof body.price === "number" ? body.price : undefined,
    category: typeof body.category === "string" ? body.category : undefined,
    sku: typeof body.sku === "string" ? body.sku : undefined,
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    images: Array.isArray(body.images) ? body.images : undefined,
  });

  return NextResponse.json({ product }, { status: 201 });
}
