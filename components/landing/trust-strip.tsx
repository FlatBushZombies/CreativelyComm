import { SiShopify, SiWoocommerce, SiEtsy, SiGoogle, SiFacebook, SiTiktok } from "react-icons/si";
import { FaAmazon } from "react-icons/fa6";
import { FadeIn } from "@/components/shared/fade-in";

const channels = [
  { name: "Shopify", icon: SiShopify },
  { name: "Amazon", icon: FaAmazon },
  { name: "Etsy", icon: SiEtsy },
  { name: "WooCommerce", icon: SiWoocommerce },
  { name: "Google Merchant", icon: SiGoogle },
  { name: "Meta", icon: SiFacebook },
  { name: "TikTok Shop", icon: SiTiktok },
];

const stats = [
  { value: "7+", label: "Marketplaces with real readiness rules built in" },
  { value: "3", label: "Plans, from a free 14-day trial to enterprise" },
  { value: "4", label: "Team roles, so owners, editors, and vendors work from one library" },
];

export function TrustStrip() {
  return (
    <section className="border-b border-border py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col items-center gap-6">
          <p className="text-sm text-muted-foreground">
            Works with every marketplace you already sell on
          </p>
          <div className="w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <ul className="animate-marquee flex w-max items-center gap-x-14">
              {[...channels, ...channels].map(({ name, icon: Icon }, i) => (
                <li
                  key={`${name}-${i}`}
                  className="flex shrink-0 items-center gap-2 text-muted-foreground/70 transition-colors hover:text-foreground"
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap text-sm font-medium">{name}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <div className="mt-10 grid gap-8 divide-y divide-border border-t border-border pt-10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08} className="pt-6 sm:px-8 sm:pt-0 first:sm:pl-0">
              <p className="font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-muted-foreground">
                {stat.label}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
