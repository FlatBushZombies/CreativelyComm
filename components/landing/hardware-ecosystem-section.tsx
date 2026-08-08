import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { Camera, Barcode, Eye, CreditCard, Package } from "lucide-react";

const hardwareWorkflows = [
  {
    icon: Camera,
    name: "Multi-Angle Capture",
    subtitle: "Your phone or webcam",
    description:
      "A guided photo session walks you through rotating the product between shots. Photos attach straight to that product's gallery.",
    worksWith: "Any phone or webcam",
  },
  {
    icon: Barcode,
    name: "Scan Station",
    subtitle: "Any barcode scanner",
    description:
      "Scan at intake to match a product by SKU and log the scan, or scan on restock to add stock automatically.",
    worksWith: "USB/Bluetooth scanners, or your camera",
  },
  {
    icon: Eye,
    name: "Pack Verification",
    subtitle: "Your phone or webcam",
    description:
      "Photograph an order right before it ships. Creates a timestamped record attached to that order.",
    worksWith: "Any phone or webcam",
  },
  {
    icon: CreditCard,
    name: "Quick Sale",
    subtitle: "Barcode-first checkout",
    description:
      "Scan items to build an order and record an in-person sale on the spot. Payment method is recorded, not processed.",
    worksWith: "Any barcode scanner",
  },
  {
    icon: Package,
    name: "Content Kit",
    subtitle: "Physical starter kit",
    description:
      "Request a ring light, backdrop, and phone mount for better photos at home. Track your request's status in-app.",
    worksWith: "Shipped to you",
  },
];

export function HardwareEcosystemSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Hardware, built in"
          title="Works with hardware you already own."
          description="No proprietary devices to buy. Multi-angle capture, barcode intake, pack verification, and in-person sales all run on your phone, a webcam, or a standard barcode scanner — connected straight into your workspace."
          layout="center"
        />

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {hardwareWorkflows.map((workflow) => {
            const Icon = workflow.icon;
            return (
              <FadeIn key={workflow.name} delay={0.05}>
                <Card className="flex h-full flex-col overflow-hidden transition-colors hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{workflow.name}</CardTitle>
                    <CardDescription className="text-xs">{workflow.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between space-y-3">
                    <p className="text-sm leading-snug text-muted-foreground">{workflow.description}</p>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {workflow.worksWith}
                    </Badge>
                  </CardContent>
                </Card>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
