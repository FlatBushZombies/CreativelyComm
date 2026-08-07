import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { Camera, Barcode, Eye, CreditCard, Package, Zap } from "lucide-react";

const hardwareSystems = [
  {
    number: "1",
    icon: Camera,
    name: "Capture Dock",
    subtitle: "Turntable + Ring Light Photo Booth",
    description:
      "Auto-fires multi-angle shots straight into your workspace. Proprietary capture metadata compounds your AI model defensibility over time.",
    moat: "Capture metadata that grows stronger",
    difficulty: "Expert",
  },
  {
    number: "2",
    icon: Barcode,
    name: "Scan Station",
    subtitle: "Barcode Scanner + Receipt Printer",
    description:
      "Intake scans auto-match SKUs, flag missing fields, and fire Meta Conversions API events on restock for dynamic retargeting.",
    moat: "System of record at physical handoff",
    difficulty: "Advanced",
  },
  {
    number: "3",
    icon: Eye,
    name: "QC Camera",
    subtitle: "Pack Station Verification",
    description:
      "Photographs outgoing items pre-ship, verifies they match listing photos, and creates timestamped proof-of-condition for dispute defense.",
    moat: "Trust signal impossible to replicate",
    difficulty: "Intermediate",
  },
  {
    number: "4",
    icon: CreditCard,
    name: "Countertop POS Reader",
    subtitle: "Card Reader + Omni-channel Sync",
    description:
      "Accept in-person card payments and sync sales inventory to every channel instantly. Add in-person buyers to Meta audiences for online retargeting.",
    moat: "Payments + omni-channel lock-in",
    difficulty: "Expert",
  },
  {
    number: "5",
    icon: Package,
    name: "Content Kit",
    subtitle: "Ring Light + Backdrop + Phone Mount",
    description:
      "Free to new paid signups ($15–25 COGS). 'Unbox → shoot → we clean it up' removes onboarding friction and activates your customer base.",
    moat: "Activation lever (test first)",
    difficulty: "Beginner",
  },
];

export function HardwareEcosystemSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Hardware Ecosystem"
          title="Moats you build, not competitors can easily copy."
          description="Optional hardware capture and fulfillment systems generate proprietary data that compounds your defensibility. Each system integrates seamlessly into the workspace — no rebundling your product."
          layout="center"
        />

        <div className="mt-16 space-y-8">
          {/* Strategy Overview */}
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent p-6 sm:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Strongest Moats</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Capture Dock (#1)</strong> and <strong>Scan Station (#2)</strong> generate
                  proprietary data the software alone can't access.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Capture metadata:</strong> angle, lighting,
                    conditions
                  </li>
                  <li>
                    <strong className="text-foreground">Restock timing:</strong> when inventory
                    moves at physical point
                  </li>
                  <li className="pt-1">
                    Both compound your AI model and become harder to rip out over time.
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-lg">Validators & Retention</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>QC Camera (#3)</strong>, <strong>POS Reader (#4)</strong>, and{" "}
                  <strong>Content Kit (#5)</strong> are strong retention or trust plays.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Content Kit:</strong> Ship free hardware as
                    onboarding hook
                  </li>
                  <li>
                    <strong className="text-foreground">Test-first:</strong> Run as Meta ad test
                    before building harder systems
                  </li>
                  <li className="pt-1">Cheapest, fastest validation of hardware appetite.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hardware Systems Grid */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {hardwareSystems.map((system) => {
              const Icon = system.icon;
              return (
                <FadeIn key={system.name} delay={0.05}>
                  <Card className="flex flex-col h-full overflow-hidden hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{system.number}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{system.name}</CardTitle>
                      <CardDescription className="text-xs">{system.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1 space-y-3">
                      <p className="text-sm text-muted-foreground leading-snug">
                        {system.description}
                      </p>

                      <div className="flex-1 pt-2 border-t border-border/50">
                        <p className="text-xs font-semibold text-primary mb-1">Moat</p>
                        <p className="text-xs text-muted-foreground">{system.moat}</p>
                      </div>

                      <Badge
                        variant="secondary"
                        className="w-fit text-xs"
                      >
                        {system.difficulty}
                      </Badge>
                    </CardContent>
                  </Card>
                </FadeIn>
              );
            })}
          </div>

          {/* Test Sequence */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-base text-amber-900">Recommended Test Sequence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-amber-900">
              <div>
                <p className="font-semibold mb-1">Phase 1: Content Kit (Weeks 1–2)</p>
                <p className="text-amber-800">
                  Run as Meta ad test with 3 ad sets (kit-led, software-led, bundle-price) at
                  ~$50–100/day. Measure CPL and signup intent. Quickest signal of hardware appetite.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Phase 2: Capture Dock vs Scan Station (Weeks 3–6)</p>
                <p className="text-amber-800">
                  Once hardware-as-hook resonates, test #1 and #2 head-to-head with waitlist landing
                  pages. Measure which proprietary data moat strongest for your seller base.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">Phase 3: POS Router + QC Layer (Weeks 7+)</p>
                <p className="text-amber-800">
                  Layer in omni-channel sync and fulfillment verification to create lock-in and trust
                  signals for paid ads.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
