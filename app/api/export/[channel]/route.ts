import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getProducts, incrementProductExports } from "@/lib/products";
import { logActivity } from "@/lib/activity";
import { EXPORT_GENERATORS } from "@/lib/export/generators";

interface RouteParams {
  params: Promise<{ channel: string }>;
}

// Route Handlers under app/api/** are never touched by proxy.ts (its matcher
// explicitly excludes "api"), so this route must check the session itself.
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { channel } = await params;

  const generator = EXPORT_GENERATORS[channel];
  if (!generator) {
    return NextResponse.json({ error: "Unknown export channel." }, { status: 404 });
  }

  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const products = await getProducts(workspace.id);
  const listedProducts = products.filter((p) => p.status === "optimized" || p.status === "published");

  if (listedProducts.length === 0) {
    return NextResponse.json(
      { error: "No optimized or published products to export yet." },
      { status: 400 }
    );
  }

  const origin = process.env.BETTER_AUTH_URL || request.nextUrl.origin;
  const storeUrl = `${origin}/store/${workspace.slug}`;

  const file = generator(listedProducts, { storeUrl });

  await incrementProductExports(listedProducts.map((p) => p.id));
  await logActivity(workspace.id, {
    type: "export",
    title: `Exported to ${channel}`,
    description: `${listedProducts.length} product${listedProducts.length === 1 ? "" : "s"} exported as a ${channel} feed`,
  });

  return new NextResponse(file.content, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    },
  });
}
