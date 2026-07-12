"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Key, Plus, Trash2, Copy, Check, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiKey } from "@/lib/api-keys";
import { createApiKeyAction, revokeApiKeyAction } from "@/app/(dashboard)/settings/actions";

export function ApiKeysPanel({ apiKeys }: { apiKeys: ApiKey[] }) {
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleCreate() {
    setError(undefined);
    startTransition(async () => {
      const result = await createApiKeyAction(name);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNewKey(result.plaintext ?? null);
      setName("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            API Keys
          </CardTitle>
          <CardDescription>
            Use a key to call the API directly, or as the foundation for a Zapier/Make
            integration later.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {newKey && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-amber-800">
                    Copy this key now — you won&apos;t see it again
                  </p>
                  <div className="mt-2 flex gap-2">
                    <code className="flex-1 truncate rounded-md bg-background px-2 py-1.5 text-xs">
                      {newKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(newKey);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Key name, e.g. Zapier"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create key
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}

          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {key.keyPrefix}••••••••
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {key.lastUsedAt
                        ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                        : "Never used"}
                    </p>
                  </div>
                  <form action={revokeApiKeyAction}>
                    <input type="hidden" name="keyId" value={key.id} />
                    <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">API reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-medium">List products</p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`curl https://your-app.example.com/api/v1/products \\
  -H "Authorization: Bearer sk_live_..."`}
            </pre>
          </div>
          <div>
            <p className="font-medium">Create a product</p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`curl -X POST https://your-app.example.com/api/v1/products \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"name": "New Product", "price": 19.99}'`}
            </pre>
          </div>
          <div>
            <p className="font-medium">Update a product</p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`curl -X PATCH https://your-app.example.com/api/v1/products/{id} \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"price": 24.99}'`}
            </pre>
          </div>
          <div>
            <p className="font-medium">Check a product&apos;s channel readiness</p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`curl https://your-app.example.com/api/v1/products/{id}/readiness \\
  -H "Authorization: Bearer sk_live_..."`}
            </pre>
          </div>
          <div>
            <p className="font-medium">Catalog-wide readiness overview</p>
            <pre className="mt-1.5 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
{`curl https://your-app.example.com/api/v1/readiness \\
  -H "Authorization: Bearer sk_live_..."`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
