import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getProductById } from "@/lib/products";
import { getChannelsWithReadiness } from "@/lib/readiness";

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

  const readiness = await getChannelsWithReadiness(product, auth.workspaceId);
  return NextResponse.json({ readiness });
}
