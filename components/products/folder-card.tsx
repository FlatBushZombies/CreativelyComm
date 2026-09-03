"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, File, Folder, Loader2, MoreVertical, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductFolder } from "@/lib/folder-utils";
import { UNCATEGORIZED_KEY } from "@/lib/folder-utils";

const STACK_OFFSETS = [
  "left-1/2 top-3 h-16 w-14 -translate-x-[68%] -rotate-6",
  "left-1/2 top-1 h-16 w-14 -translate-x-[32%] rotate-3",
  "left-1/2 top-5 h-16 w-14 -translate-x-1/2 rotate-0",
];

interface FolderCardProps {
  folder: ProductFolder;
  onOpen: () => void;
  onRename: (nextName: string) => Promise<void>;
}

export function FolderCard({ folder, onOpen, onRename }: FolderCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(folder.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUncategorized = folder.key === UNCATEGORIZED_KEY;

  useEffect(() => {
    if (renaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming]);

  async function commitRename() {
    const next = draftName.trim();
    if (!next || next === folder.name) {
      setDraftName(folder.name);
      setRenaming(false);
      return;
    }
    setSaving(true);
    try {
      await onRename(next);
    } finally {
      setSaving(false);
      setRenaming(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border-strong card-shadow transition-shadow hover:card-shadow-lg">
      {/* Gradient header with a peek of the folder's product photos */}
      <div
        className="relative h-32 shrink-0 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${folder.gradient.from}, ${folder.gradient.to})` }}
      >
        {folder.thumbnails.map((src, i) => (
          <div
            key={src + i}
            className={`absolute overflow-hidden rounded-lg border-2 border-white/80 shadow-lg ${STACK_OFFSETS[i]}`}
            style={{ zIndex: i }}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="56px" />
          </div>
        ))}
        {folder.thumbnails.length === 0 && (
          <Folder className="absolute inset-0 m-auto h-10 w-10 text-white/40" strokeWidth={1.5} />
        )}
      </div>

      {/* Dark body */}
      <div className="flex flex-1 flex-col justify-between gap-4 bg-foreground p-4 text-background">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 shrink-0" style={{ color: folder.gradient.to }} />
              {renaming ? (
                <input
                  ref={inputRef}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") {
                      setDraftName(folder.name);
                      setRenaming(false);
                    }
                  }}
                  disabled={saving}
                  className="w-full truncate rounded border border-background/30 bg-transparent px-1 -mx-1 text-sm font-semibold outline-none focus:border-background/60"
                />
              ) : (
                <p className="truncate text-sm font-semibold">{folder.name}</p>
              )}
              {saving && <Loader2 className="h-3 w-3 shrink-0 animate-spin text-background/70" />}
            </div>
            <p className="mt-1 truncate text-xs text-background/60">
              {folder.tags.length > 0 ? folder.tags.join(" · ") : isUncategorized ? "Not yet organized" : "Product folder"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Folder options"
                className="shrink-0 rounded-md p-1 text-background/60 transition-colors hover:bg-background/10 hover:text-background"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[10rem]">
              <DropdownMenuItem
                onSelect={() => {
                  setDraftName(folder.name);
                  setRenaming(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <div className="border-t border-background/15 pt-3" />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-background/70">
              <File className="h-3.5 w-3.5" />
              {folder.count} {folder.count === 1 ? "product" : "products"}
            </span>
            <button
              type="button"
              onClick={onOpen}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
              style={{ background: `linear-gradient(135deg, ${folder.gradient.from}, ${folder.gradient.to})` }}
            >
              Open
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
