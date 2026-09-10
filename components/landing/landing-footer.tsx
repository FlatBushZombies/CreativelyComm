import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

// Same source photo as the hero and mid-page CTA band, cropped for a wide,
// short footer band.
const FOOTER_IMAGE = "https://images.pexels.com/photos/7289725/pexels-photo-7289725.jpeg?auto=compress&cs=tinysrgb&w=1800";

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden">
      <Image src={FOOTER_IMAGE} alt="" fill className="object-cover object-[65%_20%]" sizes="100vw" />
      <div className="absolute inset-0 bg-foreground/85" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              The workspace where products are created, refined, and prepared
              before they reach customers — not another ecommerce platform.
            </p>
            <a
              href="mailto:support@creativelycomm.com"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" />
              support@creativelycomm.com
            </a>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Product
            </h4>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-white/15 pt-6 sm:flex-row">
          <p className="text-sm text-white/60">
            &copy; 2026 CreativelyComm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
