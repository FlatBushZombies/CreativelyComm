import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { adjustStock } from "@/lib/inventory";
import { notifySlack } from "@/lib/integrations/slack";
import { createInvoiceForOrder } from "@/lib/integrations/quickbooks";

export type OrderStatus = "open" | "paid" | "fulfilled" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "card" | "other";

export interface OrderItem {
  id: string;
  productId: string | null;
  vendorId: string | null;
  productName: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  customerName: string | null;
  customerEmail: string | null;
  subtotal: number;
  total: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  quickbooksInvoiceId: string | null;
}

interface OrderRow {
  id: string;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  customer_name: string | null;
  customer_email: string | null;
  subtotal: number | string;
  total: number | string;
  note: string | null;
  created_at: string;
  updated_at: string;
  quickbooks_invoice_id: string | null;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  vendor_id: string | null;
  product_name: string;
  sku: string | null;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
}

function mapItemRow(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    vendorId: row.vendor_id,
    productName: row.product_name,
    sku: row.sku,
    unitPrice: Number(row.unit_price),
    quantity: row.quantity,
    lineTotal: Number(row.line_total),
  };
}

function mapOrderRow(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    status: row.status,
    paymentMethod: row.payment_method,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map(mapItemRow),
    quickbooksInvoiceId: row.quickbooks_invoice_id,
  };
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  customerName?: string;
  customerEmail?: string;
  paymentMethod?: PaymentMethod;
  note?: string;
  createdBy?: string;
}

/**
 * Creates an order: validates stock for inventory-tracked products, snapshots
 * each line's price/name/vendor at order time, decrements stock per line
 * (lib/inventory.ts), and logs a real notification. This is where "order
 * automation" lives -- no payment processor is involved; paymentMethod is
 * recorded data only, not a charge.
 */
export async function createOrder(workspaceId: string, input: CreateOrderInput): Promise<Order> {
  if (input.items.length === 0) {
    throw new Error("An order needs at least one item.");
  }

  const supabase = getSupabaseServerClient();
  const productIds = input.items.map((item) => item.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, sku, price, vendor_id, track_inventory, stock_quantity")
    .eq("workspace_id", workspaceId)
    .in("id", productIds);

  if (productsError) {
    throw new Error(`Failed to load products for order: ${productsError.message}`);
  }

  const productById = new Map((products ?? []).map((p) => [p.id as string, p]));
  for (const item of input.items) {
    const product = productById.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found in this workspace.`);
    }
    if (product.track_inventory && product.stock_quantity < item.quantity) {
      throw new Error(`Not enough stock for "${product.name}" (have ${product.stock_quantity}, need ${item.quantity}).`);
    }
  }

  const lineItems = input.items.map((item) => {
    const product = productById.get(item.productId)!;
    const unitPrice = Number(product.price);
    return {
      productId: product.id as string,
      vendorId: (product.vendor_id as string | null) ?? null,
      productName: product.name as string,
      sku: (product.sku as string | null) ?? null,
      unitPrice,
      quantity: item.quantity,
      lineTotal: Math.round(unitPrice * item.quantity * 100) / 100,
    };
  });

  const subtotal = Math.round(lineItems.reduce((sum, li) => sum + li.lineTotal, 0) * 100) / 100;
  const initialStatus: OrderStatus = input.paymentMethod ? "paid" : "open";

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      workspace_id: workspaceId,
      status: initialStatus,
      payment_method: input.paymentMethod ?? null,
      customer_name: input.customerName ?? null,
      customer_email: input.customerEmail ?? null,
      subtotal,
      total: subtotal,
      note: input.note ?? null,
      created_by: input.createdBy ?? null,
    })
    .select()
    .single();

  if (orderError || !orderData) {
    throw new Error(`Failed to create order: ${orderError?.message}`);
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .insert(
      lineItems.map((li) => ({
        order_id: orderData.id,
        product_id: li.productId,
        vendor_id: li.vendorId,
        product_name: li.productName,
        sku: li.sku,
        unit_price: li.unitPrice,
        quantity: li.quantity,
        line_total: li.lineTotal,
      }))
    )
    .select();

  if (itemsError || !itemRows) {
    throw new Error(`Failed to create order items: ${itemsError?.message}`);
  }

  for (const item of input.items) {
    const product = productById.get(item.productId)!;
    if (product.track_inventory) {
      await adjustStock(item.productId, workspaceId, {
        delta: -item.quantity,
        reason: "sale",
        orderId: orderData.id,
        createdBy: input.createdBy,
      });
    }
  }

  await logActivity(workspaceId, {
    type: "order",
    title: "New order",
    description: `Order for $${subtotal.toFixed(2)} created${input.customerName ? ` — ${input.customerName}` : ""}.`,
  });
  await notifySlack(
    workspaceId,
    `:shopping_trolley: New order for $${subtotal.toFixed(2)}${input.customerName ? ` — ${input.customerName}` : ""}.`
  );

  return mapOrderRow(orderData as OrderRow, itemRows as OrderItemRow[]);
}

export interface GetOrdersFilter {
  status?: OrderStatus;
  vendorId?: string;
}

export async function getOrders(workspaceId: string, filter: GetOrdersFilter = {}): Promise<Order[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("workspace_id", workspaceId);

  if (filter.status) {
    query = query.eq("status", filter.status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load orders: ${error.message}`);
  }

  const rows = (data ?? []) as (OrderRow & { order_items: OrderItemRow[] })[];
  const orders = rows.map((row) => mapOrderRow(row, row.order_items ?? []));

  if (filter.vendorId) {
    return orders.filter((order) => order.items.some((item) => item.vendorId === filter.vendorId));
  }

  return orders;
}

export async function getOrderById(id: string, workspaceId: string): Promise<Order | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load order: ${error.message}`);
  }

  if (!data) return null;
  const row = data as OrderRow & { order_items: OrderItemRow[] };
  return mapOrderRow(row, row.order_items ?? []);
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  open: ["paid", "cancelled"],
  paid: ["fulfilled", "cancelled"],
  fulfilled: [],
  cancelled: [],
  refunded: [],
};

/**
 * Updates order status, enforcing forward-only transitions. Cancelling a
 * paid order reverses its stock deduction (reason: 'return') for any
 * inventory-tracked line items -- the automated half of "cancel an order".
 */
export async function updateOrderStatus(
  id: string,
  workspaceId: string,
  nextStatus: OrderStatus
): Promise<Order> {
  const order = await getOrderById(id, workspaceId);
  if (!order) {
    throw new Error("Order not found.");
  }

  if (!ALLOWED_TRANSITIONS[order.status].includes(nextStatus)) {
    throw new Error(`Cannot transition an order from "${order.status}" to "${nextStatus}".`);
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  // Fires only on the open->paid edge -- every order passes through "paid"
  // exactly once before "fulfilled" (see ALLOWED_TRANSITIONS), so this is
  // the natural idempotency point. quickbooksInvoiceId is a second guard.
  if (nextStatus === "paid" && !order.quickbooksInvoiceId) {
    await createInvoiceForOrder(workspaceId, {
      id: order.id,
      customerName: order.customerName,
      total: order.total,
    });
  }

  if (nextStatus === "cancelled" && order.status === "paid") {
    const trackedProductIds = order.items.map((item) => item.productId).filter((id): id is string => id !== null);
    const { data: trackedProducts } = await supabase
      .from("products")
      .select("id, track_inventory")
      .in("id", trackedProductIds.length > 0 ? trackedProductIds : [""]);
    const trackingById = new Map((trackedProducts ?? []).map((p) => [p.id as string, p.track_inventory as boolean]));

    for (const item of order.items) {
      if (!item.productId || !trackingById.get(item.productId)) continue;
      await adjustStock(item.productId, workspaceId, {
        delta: item.quantity,
        reason: "return",
        orderId: order.id,
      });
    }
  }

  const updated = await getOrderById(id, workspaceId);
  return updated!;
}
