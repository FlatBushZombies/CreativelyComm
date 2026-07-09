"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportAllButton({ channels }: { channels: string[] }) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExportAll() {
    setIsExporting(true);
    for (const channel of channels) {
      const a = document.createElement("a");
      a.href = `/api/export/${channel}`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Small stagger so the browser doesn't treat rapid-fire downloads as a popup flood.
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    setIsExporting(false);
  }

  return (
    <Button onClick={handleExportAll} disabled={isExporting || channels.length === 0}>
      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {isExporting ? "Exporting..." : "Export All Platforms"}
    </Button>
  );
}
