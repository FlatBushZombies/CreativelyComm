"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";

export function AuditViewedTracker({ auditId, avgScore }: { auditId: string; avgScore: number }) {
  useEffect(() => {
    posthog.capture("audit_viewed", { audit_id: auditId, avg_score: avgScore });
  }, [auditId, avgScore]);
  return null;
}

export function AuditSignupCta({ auditId, label }: { auditId: string; label: string }) {
  return (
    <Button
      asChild
      size="lg"
      className="rounded-full px-7"
      onClick={() => posthog.capture("audit_cta_clicked", { audit_id: auditId })}
    >
      <Link href="/signup">
        {label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
}
