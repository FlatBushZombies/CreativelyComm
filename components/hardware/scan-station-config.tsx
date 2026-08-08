"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarcodeScannerInput } from "@/components/hardware/barcode-scanner-input";
import { Barcode, Printer, CheckCircle2, XCircle } from "lucide-react";
import { setHardwareEnabledAction, logScanEventAction } from "@/app/(dashboard)/hardware/actions";
import type { ScanAction, ScanEvent } from "@/lib/hardware";

interface ScanStationConfigProps {
  enabled: boolean;
  recentScans: ScanEvent[];
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function printLabel(name: string, barcode: string) {
  const printWindow = window.open("", "_blank", "width=400,height=320");
  if (!printWindow) return;
  printWindow.document.write(`<!doctype html>
    <html><head><title>Label</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; text-align: center; }
      h1 { font-size: 16px; margin: 0 0 8px; }
      p { font-size: 12px; color: #555; margin: 0 0 16px; }
      .barcode { font-family: ui-monospace, monospace; font-size: 20px; letter-spacing: 2px; border: 1px solid #333; padding: 10px; border-radius: 4px; }
    </style>
    </head><body>
      <h1>${escapeHtml(name)}</h1>
      <p>Printed from CreativelyComm Scan Station</p>
      <div class="barcode">${escapeHtml(barcode)}</div>
    </body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function ScanStationConfig({ enabled: initialEnabled, recentScans }: ScanStationConfigProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [scanAction, setScanAction] = useState<ScanAction>("intake");
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{
    matched: boolean;
    stockUpdated: boolean;
    productName?: string;
    barcode: string;
  } | null>(null);

  function handleEnabledChange(next: boolean) {
    setEnabled(next);
    startTransition(async () => {
      await setHardwareEnabledAction("scan-station", next);
    });
  }

  function handleScan(barcode: string) {
    startTransition(async () => {
      const result = await logScanEventAction(barcode, scanAction);
      setLastResult({
        matched: result.matched,
        stockUpdated: result.stockUpdated,
        productName: result.productName,
        barcode,
      });
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Barcode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Scan Station</CardTitle>
                <CardDescription>Barcode intake with any USB or Bluetooth scanner</CardDescription>
              </div>
            </div>
            <Badge variant={enabled ? "default" : "outline"}>{enabled ? "Active" : "Inactive"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div>
              <Label className="text-sm font-medium">Enable Scan Station</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Match scans against your catalog and log every scan
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={handleEnabledChange} />
          </div>

          {enabled && (
            <>
              <div>
                <Label className="text-xs">Scan mode</Label>
                <Select value={scanAction} onValueChange={(v) => setScanAction(v as ScanAction)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intake">Intake — check a new item in</SelectItem>
                    <SelectItem value="restock">Restock — add 1 unit of stock</SelectItem>
                    <SelectItem value="verification">Verification — just log the scan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-border/50 bg-card p-4 space-y-3">
                <BarcodeScannerInput onScan={handleScan} />

                {isPending && <p className="text-xs text-muted-foreground">Logging scan…</p>}

                {lastResult && !isPending && (
                  <div
                    className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
                      lastResult.matched
                        ? "border-green-500/30 bg-green-500/5"
                        : "border-amber-500/30 bg-amber-500/5"
                    }`}
                  >
                    {lastResult.matched ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-1">
                      <p>
                        {lastResult.matched
                          ? `Matched "${lastResult.productName}"${lastResult.stockUpdated ? " — stock +1" : ""}`
                          : `No product with SKU "${lastResult.barcode}"`}
                      </p>
                      {lastResult.matched && lastResult.productName && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => printLabel(lastResult.productName!, lastResult.barcode)}
                        >
                          <Printer className="h-3 w-3" />
                          Print label
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm">Recent scans</span>
                  <Badge variant="outline">{recentScans.length}</Badge>
                </div>
                {recentScans.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No scans yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentScans.slice(0, 8).map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-muted-foreground">{scan.barcode}</span>
                        <span className="text-muted-foreground">
                          {scan.matchedProductName ?? "No match"} · {scan.action}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
