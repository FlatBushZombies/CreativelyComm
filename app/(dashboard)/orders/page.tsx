import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getOrders } from "@/lib/orders";
import { getVendorScopeForUser } from "@/lib/vendors";
import { OrdersListClient } from "./orders-list-client";

export default async function OrdersPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const vendorScope = await getVendorScopeForUser(workspace.id, session.user.id);
  const orders = await getOrders(workspace.id, { vendorId: vendorScope ?? undefined });

  return <OrdersListClient orders={orders} isVendorScoped={vendorScope !== null} />;
}
