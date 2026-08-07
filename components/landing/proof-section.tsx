import { FadeIn } from "@/components/shared/fade-in";

const stats = [
  { value: "7+", label: "Marketplaces supported, from Shopify to TikTok Shop" },
  { value: "1", label: "Plan with everything included — no feature paywalls" },
  { value: "4", label: "Team roles, so owners, editors, and vendors work from one library" },
];

export function ProofSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 divide-y divide-border border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:border-b">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08} className="pt-8 sm:px-8 sm:pt-0 first:sm:pl-0">
              <p className="font-display text-6xl font-medium tracking-tight text-primary sm:text-7xl">
                {stat.value}
              </p>
              <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-muted-foreground">
                {stat.label}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
