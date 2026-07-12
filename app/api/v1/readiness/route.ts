import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getProducts } from "@/lib/products";
import { getReadinessOverview } from "@/lib/readiness";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await getProducts(auth.workspaceId);
  const overview = await getReadinessOverview(products, auth.workspaceId);
  return NextResponse.json({ overview });
}
