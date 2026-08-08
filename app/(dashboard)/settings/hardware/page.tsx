"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CaptureDockConfig } from "@/components/hardware/capture-dock-config";
import { ScanStationConfig } from "@/components/hardware/scan-station-config";
import { QCCameraConfig } from "@/components/hardware/qc-camera-config";
import { POSReaderConfig } from "@/components/hardware/pos-reader-config";
import { ContentKitConfig } from "@/components/hardware/content-kit-config";
import { HardwareOverview } from "@/components/hardware/hardware-overview";
import {
  Camera,
  Barcode,
  Eye,
  CreditCard,
  Package,
  Zap,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const hardwareStatus = [
  {
    id: "capture-dock",
    name: "Capture Dock",
    status: "available",
    moat: "Proprietary capture metadata",
    icon: Camera,
  },
  {
    id: "scan-station",
    name: "Scan Station",
    status: "available",
    moat: "System of record at physical point",
    icon: Barcode,
  },
  {
    id: "qc-camera",
    name: "QC Camera",
    status: "available",
    moat: "Insurance-like trust layer",
    icon: Eye,
  },
  {
    id: "pos-reader",
    name: "POS Reader",
    status: "available",
    moat: "Payments + omni-channel lock-in",
    icon: CreditCard,
  },
  {
    id: "content-kit",
    name: "Content Kit",
    status: "available",
    moat: "Activation lever (test first)",
    icon: Package,
  },
];

export function HardwareSettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hardware Ecosystem</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Connect physical devices to generate proprietary data that strengthens your product
          intelligence and creates defensible competitive moats.
        </p>
      </div>

      {/* Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {hardwareStatus.map((hw) => {
          const Icon = hw.icon;
          return (
            <Card key={hw.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                  <Badge variant="outline" className="text-xs">
                    {hw.status === "available" ? "Available" : "Coming"}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{hw.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-snug">{hw.moat}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Strategy Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Implementation Strategy</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Strongest Moats (#1 & #2)</h4>
              <p className="text-muted-foreground">
                <strong>Capture Dock</strong> and <strong>Scan Station</strong> generate proprietary
                data the software alone can't access — capture metadata and restock timing
                compound your AI model defensibility over time.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Validators & Retention (#3–#5)</h4>
              <p className="text-muted-foreground">
                <strong>QC Camera</strong>, <strong>POS Reader</strong>, and <strong>Content Kit</strong> are
                good validators or retention plays but have weaker defensibility. Run <strong>Content Kit</strong> first as a cheap Meta ad test.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white/50 border border-primary/20 p-3 flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Test sequence: Content Kit (cheap, fast) → Capture Dock & Scan Station (strong moats)
              → POS Reader & QC Camera (omni-channel & trust signals)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="overview" className="text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="capture" className="text-xs">
            Capture
          </TabsTrigger>
          <TabsTrigger value="scan" className="text-xs">
            Scan
          </TabsTrigger>
          <TabsTrigger value="qc" className="text-xs">
            QC
          </TabsTrigger>
          <TabsTrigger value="pos" className="text-xs">
            POS
          </TabsTrigger>
          <TabsTrigger value="content" className="text-xs">
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <HardwareOverview />
        </TabsContent>

        <TabsContent value="capture" className="mt-6">
          <CaptureDockConfig />
        </TabsContent>

        <TabsContent value="scan" className="mt-6">
          <ScanStationConfig />
        </TabsContent>

        <TabsContent value="qc" className="mt-6">
          <QCCameraConfig />
        </TabsContent>

        <TabsContent value="pos" className="mt-6">
          <POSReaderConfig />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentKitConfig />
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Getting Started</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <p className="font-semibold text-foreground mb-1">1. Start with Content Kit</p>
            <p>
              Run as a Meta ad test ($50-100/day) to gauge if hardware-as-a-hook resonates with
              your audience before committing to harder builds.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">2. Test Capture Dock vs Scan Station</p>
            <p>
              Once hardware appetite is validated, run head-to-head tests with real waitlist
              landing pages to see which moat is stronger for your use case.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">3. Layer in POS & QC</p>
            <p>
              After core hardware is established, add POS for omni-channel sync and QC for trust
              signals in paid advertising.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HardwareSettingsPage;
