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

export function TrustStrip() {
  return (
    <section className="border-y border-border py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col items-center gap-8">
          <p className="text-sm text-muted-foreground">
            Built for teams that sell everywhere
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14">
            {channels.map(({ name, icon: Icon }) => (
              <li
                key={name}
                className="flex items-center gap-2 text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium">{name}</span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}
