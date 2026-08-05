import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { adjustStock, type StockAdjustmentReason } from "@/lib/inventory";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_REASONS: StockAdjustmentReason[] = ["restock", "sale", "correction", "return", "damaged"];

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.delta !== "number" || !VALID_REASONS.includes(body.reason)) {
    return NextResponse.json(
      { error: `"delta" (number) and "reason" (one of ${VALID_REASONS.join(", ")}) are required` },
      { status: 400 }
    );
  }

  try {
    const stockQuantity = await adjustStock(id, auth.workspaceId, {
      delta: body.delta,
      reason: body.reason,
      note: typeof body.note === "string" ? body.note : undefined,
    });
    return NextResponse.json({ stockQuantity });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
