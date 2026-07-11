"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProductTranslation } from "@/lib/translations";
import { translateProductAction, deleteTranslationAction } from "@/app/(dashboard)/products/[id]/actions";

const languageOptions = [
  { code: "ES", label: "Spanish" },
  { code: "FR", label: "French" },
  { code: "DE", label: "German" },
  { code: "PT-BR", label: "Portuguese (Brazil)" },
  { code: "IT", label: "Italian" },
  { code: "JA", label: "Japanese" },
  { code: "ZH", label: "Chinese (simplified)" },
];

export function TranslationsPanel({
  productId,
  translations,
}: {
  productId: string;
  translations: ProductTranslation[];
}) {
  const [locale, setLocale] = useState(languageOptions[0].code);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleTranslate() {
    setError(undefined);
    startTransition(async () => {
      const result = await translateProductAction(productId, locale);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          Translations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Translate this listing for cross-border marketplaces, powered by DeepL.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <Button onClick={handleTranslate} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Translating..." : "Translate"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {translations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No translations yet.</p>
        ) : (
          <div className="space-y-2">
            {translations.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t.locale}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.name}</p>
                </div>
                <form action={deleteTranslationAction}>
                  <input type="hidden" name="translationId" value={t.id} />
                  <input type="hidden" name="productId" value={productId} />
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
  );
}
