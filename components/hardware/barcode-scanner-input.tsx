"use client";

import { useEffect, useRef, useState } from "react";
import { ScanLine, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
}
type BarcodeDetectorCtor = new () => BarcodeDetectorLike;

interface BarcodeScannerInputProps {
  /** Fires for both a real HID scanner (types like a keyboard, ends in Enter) and camera-based detection. */
  onScan: (code: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Real barcode input, no simulated device. Standard USB/Bluetooth barcode
 * scanners emit keystrokes ending in Enter -- this input works with those
 * out of the box, zero pairing required. Where the browser supports the
 * native BarcodeDetector API, an optional camera-based scan mode is offered
 * too (feature-detected; hidden entirely where unsupported).
 */
export function BarcodeScannerInput({
  onScan,
  placeholder = "Scan a barcode (or type a SKU and press Enter)",
  autoFocus = true,
}: BarcodeScannerInputProps) {
  const [value, setValue] = useState("");
  const [cameraSupported] = useState(() => typeof window !== "undefined" && "BarcodeDetector" in window);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<BarcodeDetectorLike | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = value.trim();
    if (!code) return;
    onScan(code);
    setValue("");
  }

  function stopCameraScan() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    cancelAnimationFrame(rafRef.current);
    setCameraActive(false);
  }

  async function pollFrame() {
    if (!videoRef.current || !detectorRef.current) return;
    try {
      const codes = await detectorRef.current.detect(videoRef.current);
      if (codes.length > 0) {
        onScan(codes[0].rawValue);
        stopCameraScan();
        return;
      }
    } catch {
      // Per-frame detection errors are expected (blur, no code in view) -- keep polling.
    }
    rafRef.current = requestAnimationFrame(pollFrame);
  }

  async function startCameraScan() {
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!Detector) return;

    try {
      detectorRef.current = new Detector();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      rafRef.current = requestAnimationFrame(pollFrame);
    } catch {
      setCameraActive(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-9 border-primary/30"
          autoFocus={autoFocus}
        />
      </div>

      {cameraSupported &&
        (cameraActive ? (
          <div className="space-y-2">
            <video ref={videoRef} className="aspect-video w-full rounded-lg border border-border object-cover" muted playsInline />
            <Button type="button" variant="outline" size="sm" onClick={stopCameraScan} className="w-full">
              Stop camera scan
            </Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={startCameraScan} className="w-full">
            <Camera className="h-3.5 w-3.5" />
            Scan with camera instead
          </Button>
        ))}
    </div>
  );
}
