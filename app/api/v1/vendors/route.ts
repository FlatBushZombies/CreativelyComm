import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { getVendors, createVendor } from "@/lib/vendors";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendors = await getVendors(auth.workspaceId);
  return NextResponse.json({ vendors });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: '"name" is required' }, { status: 400 });
  }

  const vendor = await createVendor(auth.workspaceId, {
    name: body.name,
    contactEmail: typeof body.contactEmail === "string" ? body.contactEmail : undefined,
  });

  return NextResponse.json({ vendor }, { status: 201 });
}
