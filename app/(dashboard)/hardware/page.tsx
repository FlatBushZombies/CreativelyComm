import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProducts } from "@/lib/products";
import { getVendorScopeForUser } from "@/lib/vendors";
import { getOrders } from "@/lib/orders";
import {
  getHardwareSettings,
  getScanEvents,
  getQCPhotos,
  getContentKitRequests,
} from "@/lib/hardware";
import { HardwarePageClient } from "@/components/hardware/hardware-page-client";

export const metadata = {
  title: "Hardware — CreativelyComm",
};

export default async function HardwarePage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const vendorScope = await getVendorScopeForUser(workspace.id, session.user.id);

  const [settings, allProducts, scanEvents, paidOrders, qcPhotos, quickSales, contentKitRequests] =
    await Promise.all([
      getHardwareSettings(workspace.id),
      getProducts(workspace.id, vendorScope ?? undefined),
      getScanEvents(workspace.id),
      getOrders(workspace.id, { status: "paid" }),
      getQCPhotos(workspace.id),
      getOrders(workspace.id, { source: "pos", limit: 10 }),
      getContentKitRequests(workspace.id),
    ]);

  const products = allProducts.map((p) => ({ id: p.id, name: p.name }));
  const openOrders = paidOrders.map((order) => ({
    id: order.id,
    label: `#${order.id.slice(0, 8)}${order.customerName ? ` — ${order.customerName}` : ""} · $${order.total.toFixed(2)}`,
  }));

  return (
    <div className="min-h-screen space-y-8 pb-32">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Hardware</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Software workflows that use hardware you already own — your phone or webcam for
          multi-angle photos, any barcode scanner for intake, any printer for labels.
        </p>
      </div>

      <HardwarePageClient
        settings={settings}
        products={products}
        recentScans={scanEvents}
        openOrders={openOrders}
        recentQCPhotos={qcPhotos}
        recentQuickSales={quickSales}
        contentKitRequests={contentKitRequests}
      />
    </div>
  );
}
