import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProducts } from "@/lib/products";
import { getVendorScopeForUser } from "@/lib/vendors";
import { ProductsListClient } from "./products-list-client";

interface ProductsPageProps {
  searchParams: Promise<{ view?: string; ids?: string; folder?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const { view, ids, folder } = await searchParams;

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const vendorScope = await getVendorScopeForUser(workspace.id, session.user.id);
  const products = await getProducts(workspace.id, vendorScope ?? undefined);

  const initialView = view === "grid" || view === "table" || view === "folders" ? view : undefined;
  const initialProductIds = ids
    ? ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : undefined;

  return (
    <ProductsListClient
      products={products}
      initialView={initialView}
      initialFolder={folder}
      initialProductIds={initialProductIds}
    />
  );
}
