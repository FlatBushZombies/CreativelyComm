"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  /** Called with a real captured frame (JPEG blob from the live camera feed). */
  onCapture: (blob: Blob) => void;
  /** 0-100. Shows a brief white overlay at this opacity when capturing, using the screen as a fill light. */
  flashIntensity?: number;
  captureLabel?: string;
  disabled?: boolean;
}

/**
 * Real camera capture via getUserMedia -- no simulated/fake device state.
 * Requires user permission and a supporting browser; shared by Capture Dock
 * (multi-angle sessions) and QC Camera (single pack-verification shots).
 */
export function CameraCapture({
  onCapture,
  flashIntensity = 0,
  captureLabel = "Capture",
  disabled = false,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startCamera() {
    setError(null);
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setError("Couldn't access a camera. Check your browser's camera permission for this site.");
    } finally {
      setStarting(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !active) return;

    if (flashIntensity > 0) {
      setFlashing(true);
      setTimeout(() => setFlashing(false), 180);
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob);
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-black">
        {active ? (
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <CameraOff className="h-6 w-6" />
            <span className="text-xs">Camera is off</span>
          </div>
        )}
        {flashing && (
          <div
            className="pointer-events-none absolute inset-0 bg-white"
            style={{ opacity: flashIntensity / 100 }}
          />
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        {!active ? (
          <Button type="button" variant="outline" size="sm" className="flex-1" onClick={startCamera} disabled={starting}>
            {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            {starting ? "Starting..." : "Start camera"}
          </Button>
        ) : (
          <>
            <Button type="button" size="sm" className="flex-1" onClick={capture} disabled={disabled}>
              <Camera className="h-3.5 w-3.5" />
              {captureLabel}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={stopCamera}>
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
