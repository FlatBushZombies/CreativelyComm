import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProducts } from "@/lib/products";
import { ProductsListClient } from "./products-list-client";

export default async function ProductsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const products = await getProducts(workspace.id);

  return <ProductsListClient products={products} />;
}
