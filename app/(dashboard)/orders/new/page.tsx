import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProducts } from "@/lib/products";
import { getVendorScopeForUser } from "@/lib/vendors";
import { NewOrderClient } from "./new-order-client";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const vendorScope = await getVendorScopeForUser(workspace.id, session.user.id);
  const products = await getProducts(workspace.id, vendorScope ?? undefined);
  const { source } = await searchParams;

  return <NewOrderClient products={products} source={source === "pos" ? "pos" : "manual"} />;
}
