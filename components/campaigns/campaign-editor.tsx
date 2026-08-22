"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Check } from "lucide-react";
import { refineCampaignField } from "@/lib/campaign-ai";
import type { CampaignContent } from "@/lib/campaign-types";

const FIELD_META: Record<
  keyof CampaignContent,
  { label: string; kind: "text" | "textarea" | "list" }
> = {
  campaignName: { label: "Campaign name", kind: "text" },
  headline: { label: "Headline", kind: "text" },
  primaryCopy: { label: "Primary copy", kind: "textarea" },
  shortDescription: { label: "Short description", kind: "textarea" },
  cta: { label: "Call to action", kind: "text" },
  socialCaptions: { label: "Social captions", kind: "list" },
  hashtags: { label: "Hashtags", kind: "list" },
  emailSubject: { label: "Email subject", kind: "text" },
  emailBody: { label: "Email body", kind: "textarea" },
  whatsappMessage: { label: "WhatsApp message", kind: "textarea" },
  audienceDescription: { label: "Target audience", kind: "textarea" },
  strategy: { label: "Campaign strategy", kind: "textarea" },
  contentIdeas: { label: "Content ideas", kind: "list" },
  creativeDirection: { label: "Creative direction", kind: "textarea" },
  adVariations: { label: "Ad variations", kind: "list" },
};

const REFINE_ACTIONS = [
  { label: "Improve", instruction: "Improve this text while keeping the same meaning and roughly the same length." },
  { label: "Shorten", instruction: "Make this text noticeably shorter and punchier." },
  { label: "More persuasive", instruction: "Rewrite this to be more persuasive and benefit-focused." },
  { label: "More professional", instruction: "Rewrite this in a more professional, polished tone." },
  { label: "More casual", instruction: "Rewrite this in a more casual, conversational tone." },
];

function toTextValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value.join("\n");
  return value ?? "";
}

function fromTextValue(kind: "text" | "textarea" | "list", raw: string): string | string[] {
  if (kind === "list") {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return raw;
}

interface CampaignFieldProps {
  fieldKey: keyof CampaignContent;
  value: string | string[] | undefined;
  productName: string;
  onChange: (next: string | string[]) => void;
}

function CampaignField({ fieldKey, value, productName, onChange }: CampaignFieldProps) {
  const meta = FIELD_META[fieldKey];
  const [text, setText] = useState(toTextValue(value));
  const [refining, setRefining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function commit(next: string) {
    setText(next);
    onChange(fromTextValue(meta.kind, next));
  }

  async function handleRefine(instruction: string) {
    setError(null);
    setRefining(instruction);
    try {
      const result = await refineCampaignField(text, instruction, { productName, fieldLabel: meta.label });
      commit(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update this field.");
    } finally {
      setRefining(null);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {meta.label}
        </Label>
        {meta.kind === "list" && (
          <span className="text-[10px] text-muted-foreground">One per line</span>
        )}
      </div>

      {meta.kind === "text" ? (
        <Input value={text} onChange={(e) => commit(e.target.value)} />
      ) : (
        <Textarea value={text} onChange={(e) => commit(e.target.value)} rows={meta.kind === "list" ? 4 : 3} />
      )}

      <div className="flex flex-wrap gap-1.5">
        {REFINE_ACTIONS.map((action) => (
          <Button
            key={action.label}
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[11px]"
            disabled={refining !== null || !text.trim()}
            onClick={() => handleRefine(action.instruction)}
          >
            {refining === action.instruction ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {action.label}
          </Button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface CampaignEditorProps {
  content: CampaignContent;
  fields: (keyof CampaignContent)[];
  productName: string;
  onContentChange: (content: CampaignContent) => void;
  onSave: () => void;
  onRegenerateAll: () => void;
  saving: boolean;
  regenerating: boolean;
}

export function CampaignEditor({
  content,
  fields,
  productName,
  onContentChange,
  onSave,
  onRegenerateAll,
  saving,
  regenerating,
}: CampaignEditorProps) {
  const [, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleFieldChange(key: keyof CampaignContent, value: string | string[]) {
    onContentChange({ ...content, [key]: value });
    setSaved(false);
  }

  function handleSave() {
    setSaved(false);
    startTransition(() => {
      onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Review &amp; edit</CardTitle>
          <CardDescription>Every field is editable. Regenerate a field or the whole campaign anytime.</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRegenerateAll} disabled={regenerating}>
          {regenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Regenerate all
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.map((key) => (
          <CampaignField
            key={key}
            fieldKey={key}
            value={content[key]}
            productName={productName}
            onChange={(value) => handleFieldChange(key, value)}
          />
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
