"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HardwareOverview } from "@/components/hardware/hardware-overview";
import { CaptureDockConfig } from "@/components/hardware/capture-dock-config";
import { ScanStationConfig } from "@/components/hardware/scan-station-config";
import { QCCameraConfig } from "@/components/hardware/qc-camera-config";
import { QuickSale } from "@/components/hardware/quick-sale";
import { ContentKitConfig } from "@/components/hardware/content-kit-config";
import type { HardwareFeature, HardwareSetting, ScanEvent, QCPhoto, ContentKitRequest } from "@/lib/hardware";
import type { Order } from "@/lib/orders";

interface HardwarePageClientProps {
  settings: Record<HardwareFeature, HardwareSetting>;
  products: { id: string; name: string }[];
  recentScans: ScanEvent[];
  openOrders: { id: string; label: string }[];
  recentQCPhotos: QCPhoto[];
  recentQuickSales: Order[];
  contentKitRequests: ContentKitRequest[];
}

export function HardwarePageClient({
  settings,
  products,
  recentScans,
  openOrders,
  recentQCPhotos,
  recentQuickSales,
  contentKitRequests,
}: HardwarePageClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
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
        <TabsTrigger value="quick-sale" className="text-xs">
          Quick Sale
        </TabsTrigger>
        <TabsTrigger value="content" className="text-xs">
          Content Kit
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <HardwareOverview settings={settings} onSelectTab={setActiveTab} />
      </TabsContent>
      <TabsContent value="capture">
        <CaptureDockConfig
          enabled={settings["capture-dock"].enabled}
          config={settings["capture-dock"].config}
          products={products}
        />
      </TabsContent>
      <TabsContent value="scan">
        <ScanStationConfig enabled={settings["scan-station"].enabled} recentScans={recentScans} />
      </TabsContent>
      <TabsContent value="qc">
        <QCCameraConfig
          enabled={settings["qc-camera"].enabled}
          openOrders={openOrders}
          recentPhotos={recentQCPhotos}
        />
      </TabsContent>
      <TabsContent value="quick-sale">
        <QuickSale enabled={settings["quick-sale"].enabled} recentSales={recentQuickSales} />
      </TabsContent>
      <TabsContent value="content">
        <ContentKitConfig requests={contentKitRequests} />
      </TabsContent>
    </Tabs>
  );
}
