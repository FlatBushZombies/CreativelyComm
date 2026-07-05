"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BeforeAfterPreviewProps {
  beforeImage: string;
  afterImage: string;
  productName: string;
}

export function BeforeAfterPreview({
  beforeImage,
  afterImage,
  productName,
}: BeforeAfterPreviewProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          Before / After Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-lg cursor-col-resize select-none"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={(e) => {
            if (isDragging) {
              handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
            }
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            handleMove(touch.clientX, e.currentTarget.getBoundingClientRect());
          }}
        >
          <Image
            src={afterImage}
            alt={`${productName} - optimized`}
            fill
            className="object-cover"
            sizes="600px"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="relative h-full" style={{ width: `${100 / (sliderPosition / 100)}%` }}>
              <Image
                src={beforeImage}
                alt={`${productName} - original`}
                fill
                className="object-cover"
                sizes="600px"
              />
            </div>
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
              <ArrowLeftRight className="h-4 w-4 text-foreground" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
            Before
          </div>
          <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
            After
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Drag the slider to compare original and AI-optimized images
        </p>
      </CardContent>
    </Card>
  );
}
