"use client";

import { useState } from "react";
import { Check, Copy, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmbedCodeBox({ embedUrl }: { embedUrl: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<iframe src="${embedUrl}" width="100%" height="600" style="border:0"></iframe>`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          Embed on your website
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste this snippet into any page to show your product grid there
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2">
          <pre className="flex-1 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
            <code>{snippet}</code>
          </pre>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(snippet);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
