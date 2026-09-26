"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { runPublicAudit } from "@/lib/public-audit";

export interface AuditFormState {
  error?: string;
}

/**
 * Public (no session). The client IP only feeds a hashed hourly rate limit; behind
 * a proxy the first x-forwarded-for entry is the visitor.
 */
export async function runAuditAction(_prev: AuditFormState, formData: FormData): Promise<AuditFormState> {
  const domain = String(formData.get("domain") ?? "");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  const result = await runPublicAudit(domain, ip);
  if (!result.ok) return { error: result.error };
  redirect(`/audit/${result.id}`);
}
