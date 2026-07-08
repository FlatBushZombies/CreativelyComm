"use client";

import { useState } from "react";
import { Check, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareStoreButtons({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Link copied" : "Share Store"}
      </Button>
      <Button variant="outline" size="sm" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
          Open in New Tab
        </a>
      </Button>
    </div>
  );
}
