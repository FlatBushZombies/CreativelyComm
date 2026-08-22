import { ScanLine, Bell, Zap } from "lucide-react";
import { SiQuickbooks, SiShopify } from "react-icons/si";
import { FaSlack } from "react-icons/fa6";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { Card, CardContent } from "@/components/ui/card";

const supportingFeatures = [
  {
    icon: Bell,
    title: "Automatic alerts",
    description: "Stock deducts on every order, and low-stock alerts post to Slack the moment inventory needs attention.",
  },
  {
    icon: Zap,
    title: "Runs itself",
    description: "Mark an order paid and an invoice is created in QuickBooks automatically — no manual bookkeeping.",
  },
  {
    icon: SiShopify,
    title: "Two-way Shopify sync",
    description: "Connect your own Shopify store and keep products and inventory in sync in both directions.",
  },
];

export function OperationsSection() {
  return (
    <section className="bg-muted/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Ecommerce operations"
          title="Take orders and keep inventory honest, without extra tools."
          description="A barcode-first checkout for in-person sales, automatic stock tracking, and the connections that keep everything else in sync."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <FadeIn>
            <Card className="h-full overflow-hidden">
              <CardContent className="flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ScanLine className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold tracking-tight">Quick Sale, barcode-first</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Scan an item to add it to an order — works with any USB or Bluetooth barcode
                    scanner. Stock deducts automatically, and the sale lands in the same order
                    list as everything else.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                    <ScanLine className="h-3.5 w-3.5 text-primary" />
                    Scan a barcode or type a SKU and press Enter
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <StaggerContainer className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {supportingFeatures.map((feature) => (
              <StaggerItem key={feature.title}>
                <div className="flex h-full gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        <FadeIn delay={0.1} className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Also connects with:</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs">
            <FaSlack className="h-3 w-3" /> Slack
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs">
            <SiQuickbooks className="h-3 w-3" /> QuickBooks
          </span>
        </FadeIn>
      </div>
    </section>
  );
}
