import { Check } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";

const claims = [
  "No credit card required",
  "14-day free trial",
  "Real marketplace rules, not guesses",
  "Cancel anytime",
];

export function TrustBar() {
  return (
    <section className="border-b border-border py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {claims.map((claim) => (
            <span key={claim} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {claim}
            </span>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
