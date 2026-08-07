import { HardwareOverview } from "@/components/hardware/hardware-overview";

export const metadata = {
  title: "Hardware Systems — CreativelyComm",
};

export default function HardwarePage() {
  return (
    <div className="min-h-screen space-y-8 pb-32">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Hardware Systems</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Physical systems that generate proprietary data to strengthen your product intelligence. 
          Each captures insights that pure-software competitors can&apos;t replicate.
        </p>
      </div>

      <HardwareOverview />

      <div className="rounded-lg border border-border/50 bg-card/50 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          How Hardware Builds Your Moat
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-sm mb-2">Data Advantage</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Capture turntable angles, lighting profiles, scan timing, and fulfillment verification—data no 
              pure-software platform can access.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">System Lock-in</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Once sellers scan at intake, verify shipments, or sync POS, you&apos;re the system of record. 
              Switching costs skyrocket.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Defensible Trust Signals</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verified fulfillment, instant restocking, omni-channel sync—trust attributes most small 
              sellers can&apos;t build alone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
