import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProducts } from "@/lib/products";
import { getVendorScopeForUser } from "@/lib/vendors";
import { ProductsListClient } from "./products-list-client";

export default async function ProductsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const vendorScope = await getVendorScopeForUser(workspace.id, session.user.id);
  const products = await getProducts(workspace.id, vendorScope ?? undefined);

  return <ProductsListClient products={products} />;
}
