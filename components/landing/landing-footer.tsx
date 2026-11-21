import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Free store audit", href: "/audit" },
];

export function LandingFooter() {
  return (
    <footer className="bg-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Turn every product into a checked, measurable sales funnel — so the next launch is clearer, safer, and better prepared.
            </p>
            <a
              href="mailto:support@creativelycomm.com"
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4" />
              support@creativelycomm.com
            </a>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/40">
              Product
            </h4>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-sm text-white/40">
            &copy; 2026 CreatlyComm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
