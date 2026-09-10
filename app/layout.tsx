import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rza = localFont({
  src: "../public/fonts/Rza-Light.otf",
  variable: "--font-display",
  weight: "300",
});

// One family covers both body copy and the single-accent-word italic
// treatment (e.g. "Before" in the hero) — see the .font-accent rule in
// globals.css, which points at this same variable with font-style: italic.
const neueMontreal = localFont({
  variable: "--font-body",
  src: [
    { path: "../public/fonts/neue-montreal-font-family/neuemontreal-light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/neue-montreal-font-family/neuemontreal-lightitalic.otf", weight: "300", style: "italic" },
    { path: "../public/fonts/neue-montreal-font-family/neuemontreal-regular.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/neue-montreal-font-family/neuemontreal-italic.otf", weight: "400", style: "italic" },
    { path: "../public/fonts/neue-montreal-font-family/neuemontreal-medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/neue-montreal-font-family/neuemontreal-mediumitalic.otf", weight: "500", style: "italic" },
    { path: "../public/fonts/neue-montreal-font-family/neuemontreal-bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/neue-montreal-font-family/neuemontreal-bolditalic.otf", weight: "700", style: "italic" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "CreativelyComm",
    template: "%s | CreativelyComm",
  },
  description:
    "The workspace where products are created, refined, and made ready for every channel — not another ecommerce platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${neueMontreal.variable} ${geistMono.variable} ${rza.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        {/* Puter.js: powers the real Lifestyle/White Background AI tool on the
            product page under the "user pays" model -- each user authenticates
            with their own free Puter account when they first generate an
            image, so there's no API key for us to manage and no AI cost on
            our side. See lib/puter.ts. */}
        <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
      </body>
    </html>
  );
}
