"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Upload, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProductAction } from "@/app/(dashboard)/products/actions";

export function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function resetPreviews() {
    previews.forEach((p) => URL.revokeObjectURL(p.url));
    setPreviews([]);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      resetPreviews();
      setError(undefined);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    resetPreviews();
    setPreviews(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
  }

  function removePreview(index: number) {
    const next = [...previews];
    const [removed] = next.splice(index, 1);
    URL.revokeObjectURL(removed.url);
    setPreviews(next);

    if (fileInputRef.current) {
      const dt = new DataTransfer();
      next.forEach((p) => dt.items.add(p.file));
      fileInputRef.current.files = dt.files;
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(undefined);

    startTransition(async () => {
      const result = await createProductAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      handleOpenChange(false);
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add Product
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a product</DialogTitle>
          <DialogDescription>
            Add product details and upload photos to your library.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="Artisan Ceramic Mug" className="mt-1.5" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Handcrafted ceramic mug with a matte glaze finish..."
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="34.99" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="Home & Kitchen" className="mt-1.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" placeholder="ACM-001" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" placeholder="ceramic, handmade" className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label htmlFor="images">Photos</Label>
            <label
              htmlFor="images"
              className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/40 hover:bg-accent/50"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload, or drag and drop
              </span>
              <span className="text-xs text-muted-foreground">JPG, PNG, WEBP up to 8MB each</span>
            </label>
            <input
              ref={fileInputRef}
              id="images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />

            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {previews.map((p, i) => (
                  <div key={p.url} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                    <Image src={p.url} alt="" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isPending ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
