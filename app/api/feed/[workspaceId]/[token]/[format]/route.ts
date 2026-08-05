import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getWorkspaceById } from "@/lib/workspace";
import { getProducts } from "@/lib/products";
import { generateGoogleMerchantXml, generateFacebookCatalogCsv } from "@/lib/export/generators";

interface RouteParams {
  params: Promise<{ workspaceId: string; token: string; format: string }>;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Live feed URLs for Google Merchant Center / Meta Commerce Manager's own
 * scheduled-fetch mechanism -- no OAuth, no download-disposition header (it
 * must render inline for their fetchers), no session check (the token in
 * the URL path is the auth).
 */
export async function GET(request: Request, { params }: RouteParams) {
  const { workspaceId, token, format } = await params;

  const workspace = await getWorkspaceById(workspaceId);
  if (!workspace || !safeEqual(token, workspace.feedToken)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const products = await getProducts(workspace.id);
  const origin = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const storeUrl = `${origin}/store/${workspace.slug}`;

  if (format === "google.xml") {
    const file = generateGoogleMerchantXml(products, { storeUrl });
    return new NextResponse(file.content, { headers: { "Content-Type": file.contentType } });
  }

  if (format === "facebook.csv") {
    const file = generateFacebookCatalogCsv(products, { storeUrl });
    return new NextResponse(file.content, { headers: { "Content-Type": file.contentType } });
  }

  return NextResponse.json({ error: "Unknown format" }, { status: 404 });
}
