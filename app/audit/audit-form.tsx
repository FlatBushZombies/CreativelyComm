"use client";

import { useActionState } from "react";
import { Loader2, Search } from "lucide-react";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runAuditAction, type AuditFormState } from "./actions";

const initialState: AuditFormState = {};

export function AuditForm() {
  const [state, formAction, isPending] = useActionState(runAuditAction, initialState);

  return (
    <form action={formAction} onSubmit={() => posthog.capture("audit_started")} className="mx-auto w-full max-w-xl">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="domain"
          placeholder="mystore.com"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-label="Your store's web address"
          aria-invalid={state.error ? true : undefined}
          className="h-11 flex-1 bg-background"
        />
        <Button type="submit" size="lg" disabled={isPending} className="h-11 rounded-full px-6">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {isPending ? "Auditing…" : "Audit my store"}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}
