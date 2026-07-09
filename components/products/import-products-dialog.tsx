"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Download, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { importProductsAction, type ImportProductsState } from "@/app/(dashboard)/products/actions";
import { generateTemplateCsv } from "@/lib/import/template";

export function ImportProductsDialog() {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportProductsState | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setResult(null);
      setFileName(null);
    }
  }

  function handleDownloadTemplate() {
    const blob = new Blob([generateTemplateCsv()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setResult(null);

    startTransition(async () => {
      const res = await importProductsAction(formData);
      setResult(res);
      if (!res.error) {
        formRef.current?.reset();
        setFileName(null);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <FileSpreadsheet className="h-4 w-4" />
        Import CSV
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV to create many products at once. Rows with problems are skipped and
            reported — the rest still import.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <Download className="h-3.5 w-3.5" />
          Download template CSV
        </button>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="csv-file"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/40 hover:bg-accent/50"
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {fileName || "Click to choose a CSV file"}
            </span>
          </label>
          <input
            id="csv-file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />

          {result?.error && <p className="text-sm text-red-600">{result.error}</p>}
          {typeof result?.imported === "number" && (
            <p className="text-sm text-emerald-600">
              Imported {result.imported} product{result.imported === 1 ? "" : "s"}.
            </p>
          )}
          {result?.rowErrors && result.rowErrors.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50/50 p-3 space-y-1">
              {result.rowErrors.map((err, i) => (
                <p key={i} className="text-xs text-amber-700">
                  {err}
                </p>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isPending || !fileName}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isPending ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
