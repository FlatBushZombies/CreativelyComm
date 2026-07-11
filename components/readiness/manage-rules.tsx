"use client";

import { useState } from "react";
import { Plus, Trash2, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Channel, CustomRule, RuleCheckType } from "@/lib/readiness";
import { createCustomRuleAction, deleteCustomRuleAction } from "@/app/(dashboard)/readiness/actions";

const checkTypeOptions: { value: RuleCheckType; label: string }[] = [
  { value: "field_present", label: "Field is present" },
  { value: "field_positive", label: "Number is greater than 0" },
  { value: "min_array_length", label: "List has at least N items" },
  { value: "min_text_length", label: "Text is at least N characters" },
];

const fieldOptions = ["name", "description", "sku", "category", "price", "images", "tags"];

export function ManageRules({
  channels,
  customRules,
}: {
  channels: Channel[];
  customRules: CustomRule[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [checkType, setCheckType] = useState<RuleCheckType>("field_present");
  const [error, setError] = useState<string | undefined>();

  const needsMin = checkType === "min_array_length" || checkType === "min_text_length";

  async function handleSubmit(formData: FormData) {
    setError(undefined);
    const result = await createCustomRuleAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowForm(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            Custom readiness rules
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Add your own checks on top of the defaults — specific to how your workspace lists
            products.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          Add rule
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form action={handleSubmit} className="space-y-3 rounded-lg border border-border p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="channelId">Channel</Label>
                <select
                  id="channelId"
                  name="channelId"
                  required
                  className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="checkType">Check type</Label>
                <select
                  id="checkType"
                  name="checkType"
                  value={checkType}
                  onChange={(e) => setCheckType(e.target.value as RuleCheckType)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {checkTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="label">Rule name</Label>
                <Input id="label" name="label" required placeholder="Has care instructions" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="key">Internal key</Label>
                <Input id="key" name="key" required placeholder="care_instructions" className="mt-1.5" />
              </div>
            </div>

            <div className={needsMin ? "grid grid-cols-3 gap-3" : "grid grid-cols-2 gap-3"}>
              <div>
                <Label htmlFor="field">Product field to check</Label>
                <select
                  id="field"
                  name="field"
                  required
                  className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {fieldOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              {needsMin && (
                <div>
                  <Label htmlFor="min">Minimum</Label>
                  <Input id="min" name="min" type="number" min="1" defaultValue="1" className="mt-1.5" />
                </div>
              )}
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" name="weight" type="number" min="1" defaultValue="10" className="mt-1.5" />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" size="sm">Save rule</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {customRules.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No custom rules yet — the defaults are still active for every channel.
          </p>
        ) : (
          <div className="space-y-2">
            {customRules.map((rule) => {
              const channel = channels.find((c) => c.id === rule.channelId);
              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{rule.label}</p>
                      <Badge variant="secondary">{channel?.name ?? "Unknown channel"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Checks &quot;{String(rule.config.field)}&quot; · weight {rule.weight}
                    </p>
                  </div>
                  <form action={deleteCustomRuleAction}>
                    <input type="hidden" name="ruleId" value={rule.id} />
                    <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
