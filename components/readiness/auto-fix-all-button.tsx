"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Loader2 } from "lucide-react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { bulkAutoFixReadinessAction } from "@/app/(dashboard)/readiness/actions";

export function AutoFixAllButton() {
  const router = useRouter();
  const [isFixing, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    setMessage(null);
    startTransition(async () => {
      const result = await bulkAutoFixReadinessAction();
      if (result.error) {
        setMessage(result.error);
        return;
      }
      posthog.capture("readiness_auto_fixed_all", {
        products_fixed: result.productsFixed ?? 0,
        issues_fixed: result.issuesFixed ?? 0,
      });

      const productsFixed = result.productsFixed ?? 0;
      const issuesFixed = result.issuesFixed ?? 0;
      const stillNeedingWork = result.productsStillNeedingWork ?? 0;

      const parts: string[] = [];
      parts.push(
        productsFixed === 0
          ? "Nothing to auto-fix right now — every product either already passes or only has issues that need your input."
          : `Fixed ${issuesFixed} issue${issuesFixed === 1 ? "" : "s"} across ${productsFixed} product${productsFixed === 1 ? "" : "s"}.`
      );
      if (stillNeedingWork > 0) {
        parts.push(`${stillNeedingWork} product${stillNeedingWork === 1 ? "" : "s"} still need${stillNeedingWork === 1 ? "s" : ""} your input (price and/or photos).`);
      }
      setMessage(parts.join(" "));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="outline" size="sm" onClick={handleClick} disabled={isFixing}>
        {isFixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
        {isFixing ? "Fixing…" : "Fix all products automatically"}
      </Button>
      {message && <p className="max-w-sm text-right text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
