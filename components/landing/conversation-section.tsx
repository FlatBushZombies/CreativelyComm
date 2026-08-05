"use client";

import { Crown, ShieldCheck, Pencil, Eye, CheckCircle2, MessageCircle } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";

// Role avatars, not people -- CreativelyComm has no customer photos to show,
// so team roles stand in for "who's in the room" instead of invented faces.
const roleAvatars = [
  { icon: Crown, label: "Owner", className: "bg-primary" },
  { icon: ShieldCheck, label: "Admin", className: "bg-emerald-500" },
  { icon: Pencil, label: "Editor", className: "bg-amber-500" },
  { icon: Eye, label: "Viewer", className: "bg-sky-500" },
];

export function ConversationSection() {
  return (
    <section id="workflow" className="relative overflow-hidden py-24 sm:py-32">
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex items-center justify-center -space-x-3">
            {roleAvatars.map(({ icon: Icon, label, className }) => (
              <span
                key={label}
                title={label}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-background text-white shadow-sm ${className}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>

          <h2 className="font-display mt-8 text-3xl font-medium tracking-tight sm:text-5xl">
            Built for teams, not just one uploader
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Invite teammates with owner, admin, editor, or viewer roles. Everyone
            works from the same product library — nobody emails a spreadsheet
            back and forth.
          </p>
        </FadeIn>

        {/* Loosely scattered chat-bubble callouts, not a grid -- deliberately
            informal placement to bridge into the next section. */}
        <div className="relative mx-auto mt-16 h-40 max-w-2xl sm:h-48">
          <FadeIn
            delay={0.25}
            direction="left"
            className="absolute left-0 top-0 hidden -rotate-3 sm:block"
          >
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-left text-sm card-shadow-lg">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              <span>Marked 6 listings ready for Amazon</span>
            </div>
          </FadeIn>

          <FadeIn
            delay={0.4}
            direction="right"
            className="absolute right-2 top-14 hidden rotate-2 sm:block"
          >
            <div className="flex items-center gap-2 rounded-2xl rounded-br-sm border border-border bg-card px-4 py-3 text-left text-sm card-shadow-lg">
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
              <span>Left a note on SKU-1042 before export</span>
            </div>
          </FadeIn>

          <FadeIn
            delay={0.55}
            className="absolute left-1/2 bottom-0 hidden -translate-x-1/2 rotate-1 sm:block"
          >
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-left text-sm card-shadow-lg">
              <Pencil className="h-4 w-4 shrink-0 text-primary" />
              <span>Editor role can&apos;t touch billing or team settings</span>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
