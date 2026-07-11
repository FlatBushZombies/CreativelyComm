import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getProductById, updateProduct } from "@/lib/products";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await getProductById(id, auth.workspaceId);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const product = await updateProduct(id, auth.workspaceId, {
    name: typeof body.name === "string" ? body.name : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    price: typeof body.price === "number" ? body.price : undefined,
    category: typeof body.category === "string" ? body.category : undefined,
    sku: typeof body.sku === "string" ? body.sku : undefined,
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    status: typeof body.status === "string" ? body.status : undefined,
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
