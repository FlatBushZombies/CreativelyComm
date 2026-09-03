"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { refineCampaignField } from "@/lib/campaign-ai";
import { cn } from "@/lib/utils";

const REFINE_ACTIONS = [
  { label: "Improve", instruction: "Improve this text while keeping the same meaning and roughly the same length." },
  { label: "Shorten", instruction: "Make this text noticeably shorter and punchier." },
  { label: "More persuasive", instruction: "Rewrite this to be more persuasive and benefit-focused." },
  { label: "More professional", instruction: "Rewrite this in a more professional, polished tone." },
  { label: "More casual", instruction: "Rewrite this in a more casual, conversational tone." },
];

interface EditableTextProps {
  value: string;
  onChange: (next: string) => void;
  productName: string;
  fieldLabel: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  align?: "left" | "center";
  /** "content" shrinks the field to fit its text (e.g. a pill-styled CTA button) instead of stretching to the full row width. */
  fit?: "full" | "content";
}

/**
 * The campaign preview IS the editor: click any piece of copy to type over
 * it directly, styled identically to the surrounding mockup so it never
 * looks like a form. AI is a small ✨ affordance that only appears on
 * hover/focus, not a wall of always-visible buttons -- manual editing is
 * the primary path, AI refinement is one click away when wanted.
 */
export function EditableText({
  value,
  onChange,
  productName,
  fieldLabel,
  placeholder,
  multiline,
  className,
  align = "left",
  fit = "full",
}: EditableTextProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [refining, setRefining] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleRefine(instruction: string) {
    setError(null);
    setRefining(instruction);
    try {
      const result = await refineCampaignField(value, instruction, { productName, fieldLabel });
      onChange(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update this.");
    } finally {
      setRefining(null);
      setMenuOpen(false);
    }
  }

  const fieldClassName = cn(
    "block resize-none rounded-md border border-transparent bg-transparent px-1 -mx-1 outline-none transition-colors",
    fit === "full" ? "w-full" : "w-auto",
    "hover:border-dashed hover:border-border-strong",
    "focus:border-solid focus:border-primary/40 focus:bg-primary/5 focus:ring-0",
    "placeholder:text-muted-foreground/60",
    align === "center" && "text-center",
    className
  );

  return (
    <span
      ref={wrapperRef}
      className={cn("group/field relative inline-block align-top", fit === "full" && "w-full")}
    >
      {multiline ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className={cn(fieldClassName, "overflow-hidden leading-relaxed")}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={fit === "content" ? { width: `${Math.max(value.length, placeholder?.length ?? 4) + 2}ch` } : undefined}
          className={fieldClassName}
        />
      )}

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={`Refine ${fieldLabel} with AI`}
        className={cn(
          "absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border-strong bg-card text-primary opacity-0 shadow-sm transition-opacity",
          "group-hover/field:opacity-100 group-focus-within/field:opacity-100",
          menuOpen && "opacity-100"
        )}
      >
        {refining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-6 z-20 w-44 rounded-lg border border-border-strong bg-popover p-1 card-shadow-lg">
          {REFINE_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={refining !== null || !value.trim()}
              onClick={() => handleRefine(action.instruction)}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              {action.label}
              {refining === action.instruction && <Loader2 className="h-3 w-3 animate-spin" />}
            </button>
          ))}
          {error && <p className="px-2 py-1 text-[11px] text-red-600">{error}</p>}
        </div>
      )}
    </span>
  );
}
