import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getOrderById, updateOrderStatus, type OrderStatus } from "@/lib/orders";

const VALID_STATUSES: OrderStatus[] = ["open", "paid", "fulfilled", "cancelled", "refunded"];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id, auth.workspaceId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `"status" must be one of ${VALID_STATUSES.join(", ")}` }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(id, auth.workspaceId, body.status);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
