"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { CAMPAIGN_OBJECTIVES, CAMPAIGN_CHANNELS, type CampaignObjective, type CampaignChannel } from "@/lib/campaign-types";
import type { CampaignSettings } from "@/lib/campaign-ai";

const LOADING_MESSAGES = [
  "Analyzing your product…",
  "Identifying your audience…",
  "Developing campaign strategy…",
  "Writing promotional content…",
];

interface CampaignSettingsFormProps {
  initial: CampaignSettings;
  generating: boolean;
  error: string | null;
  onGenerate: (settings: CampaignSettings) => void;
}

/**
 * The "Generate" step. The cycling text below is deliberately not a
 * step-by-step checklist with checkmarks -- this is one real AI call, not
 * several real backend stages, so implying otherwise would be dishonest.
 * It's just ambient copy while the single call is in flight.
 */
export function CampaignSettingsForm({ initial, generating, error, onGenerate }: CampaignSettingsFormProps) {
  const [objective, setObjective] = useState<CampaignObjective>(initial.objective);
  const [channel, setChannel] = useState<CampaignChannel>(initial.channel);
  const [audience, setAudience] = useState(initial.audience ?? "");
  const [tone, setTone] = useState(initial.tone ?? "");
  const [duration, setDuration] = useState(initial.duration ?? "");
  const [offer, setOffer] = useState(initial.offer ?? "");
  const [additionalInstructions, setAdditionalInstructions] = useState(initial.additionalInstructions ?? "");
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, [generating]);

  function handleSubmit() {
    setMessageIndex(0);
    onGenerate({
      objective,
      channel,
      audience: audience.trim() || undefined,
      tone: tone.trim() || undefined,
      duration: duration.trim() || undefined,
      offer: offer.trim() || undefined,
      additionalInstructions: additionalInstructions.trim() || undefined,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Campaign settings
        </CardTitle>
        <CardDescription>Configure the campaign, then generate a first draft.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Objective</Label>
            <Select value={objective} onValueChange={(v) => setObjective(v as CampaignObjective)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_OBJECTIVES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Channel</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as CampaignChannel)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_CHANNELS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="audience">Target audience</Label>
            <Input
              id="audience"
              placeholder="e.g. Gift shoppers, 25-45"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="tone">Tone of voice</Label>
            <Input
              id="tone"
              placeholder="e.g. Warm and confident"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="duration">Campaign duration</Label>
            <Input
              id="duration"
              placeholder="e.g. 2 weeks"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="offer">Discount / offer (optional)</Label>
            <Input
              id="offer"
              placeholder="e.g. 20% off"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="instructions">Additional instructions</Label>
          <Textarea
            id="instructions"
            placeholder="Anything specific to mention or avoid"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            rows={3}
            className="mt-1.5"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handleSubmit} disabled={generating} className="w-full sm:w-auto">
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {LOADING_MESSAGES[messageIndex]}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate campaign
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
