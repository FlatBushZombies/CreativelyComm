import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getOrderById } from "@/lib/orders";
import { OrderDetailClient } from "./order-detail-client";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const order = await getOrderById(id, workspace.id);

  if (!order) {
    notFound();
  }

  const storeName = workspace.storeName || workspace.name;

  return <OrderDetailClient order={order} storeName={storeName} />;
}
