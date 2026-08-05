import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getOrders, createOrder, type OrderStatus } from "@/lib/orders";

const VALID_STATUSES: OrderStatus[] = ["open", "paid", "fulfilled", "cancelled", "refunded"];

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const status = VALID_STATUSES.includes(statusParam as OrderStatus) ? (statusParam as OrderStatus) : undefined;

  const orders = await getOrders(auth.workspaceId, { status });
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: '"items" (non-empty array) is required' }, { status: 400 });
  }

  const items = body.items.map((item: { productId?: unknown; quantity?: unknown }) => ({
    productId: String(item.productId),
    quantity: Number(item.quantity),
  }));

  try {
    const order = await createOrder(auth.workspaceId, {
      items,
      customerName: typeof body.customerName === "string" ? body.customerName : undefined,
      customerEmail: typeof body.customerEmail === "string" ? body.customerEmail : undefined,
      paymentMethod: ["cash", "card", "other"].includes(body.paymentMethod) ? body.paymentMethod : undefined,
      note: typeof body.note === "string" ? body.note : undefined,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
