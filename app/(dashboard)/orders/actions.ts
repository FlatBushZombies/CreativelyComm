"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { createOrder, updateOrderStatus, type OrderStatus, type PaymentMethod, type OrderSource } from "@/lib/orders";

export interface CreateOrderState {
  error?: string;
  orderId?: string;
}

export async function createOrderAction(formData: FormData): Promise<CreateOrderState> {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  const itemsRaw = String(formData.get("items") ?? "[]");
  let items: { productId: string; quantity: number }[];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { error: "Invalid order items." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one product to the order." };
  }

  const paymentMethodRaw = String(formData.get("paymentMethod") ?? "");
  const paymentMethod = (["cash", "card", "other"] as PaymentMethod[]).includes(
    paymentMethodRaw as PaymentMethod
  )
    ? (paymentMethodRaw as PaymentMethod)
    : undefined;

  const sourceRaw = String(formData.get("source") ?? "");
  const source: OrderSource = sourceRaw === "pos" ? "pos" : "manual";

  try {
    const order = await createOrder(workspace.id, {
      items,
      customerName: String(formData.get("customerName") ?? "").trim() || undefined,
      customerEmail: String(formData.get("customerEmail") ?? "").trim() || undefined,
      paymentMethod,
      source,
      note: String(formData.get("note") ?? "").trim() || undefined,
      createdBy: session.user.id,
    });
    revalidatePath("/orders");
    return { orderId: order.id };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create order." };
  }
}

export async function updateOrderStatusAction(formData: FormData) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const orderId = String(formData.get("orderId") ?? "");
  const nextStatus = String(formData.get("status") ?? "") as OrderStatus;
  if (!orderId || !nextStatus) return;

  await updateOrderStatus(orderId, workspace.id, nextStatus);
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}
