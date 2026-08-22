import type { Metadata } from "next";
import { Inter, Geist_Mono, Fraunces, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

// Used only for the single accent-word pattern in the new hero headline —
// never for full headings or body copy.
const instrumentSerif = Instrument_Serif({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
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
      className={`${inter.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSerif.variable} h-full antialiased`}
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
