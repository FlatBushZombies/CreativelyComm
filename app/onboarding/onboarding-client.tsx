"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Sparkles, Store } from "lucide-react";
import { SiShopify, SiEtsy, SiInstagram } from "react-icons/si";
import { FaAmazon } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { saveStoreNameAction } from "./actions";

const channels = [
  { id: "shopify", label: "Shopify", icon: SiShopify },
  { id: "amazon", label: "Amazon", icon: FaAmazon },
  { id: "etsy", label: "Etsy", icon: SiEtsy },
  { id: "social", label: "Instagram & social", icon: SiInstagram },
  { id: "in-person", label: "In-person / markets", icon: Store },
  { id: "new", label: "Just getting started", icon: Sparkles },
];

const TOTAL_STEPS = 3;

export function OnboardingClient({
  firstName,
  initialStoreName,
}: {
  firstName: string;
  initialStoreName: string;
}) {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState(initialStoreName);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggleChannel(id: string) {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function goToStep1() {
    startTransition(async () => {
      await saveStoreNameAction(storeName);
      setStep(2);
    });
  }

  const primaryChannel = channels.find((c) => selectedChannels.has(c.id) && c.id !== "new");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo size="sm" />
        <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Skip for now
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg">
          <div className="mb-10 flex items-center gap-3">
            <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {step}/{TOTAL_STEPS}
            </span>
          </div>

          {step === 1 && (
            <div className="text-center">
              <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl">
                Welcome, {firstName}.
              </h1>
              <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                Let&apos;s get your workspace ready to sell everywhere. This takes about a minute.
              </p>

              <div className="mt-10 rounded-2xl border border-border-strong bg-card p-6 text-left card-shadow-lg sm:p-8">
                <Label htmlFor="storeName">What should we call your store?</Label>
                <Input
                  id="storeName"
                  className="mt-2"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Sedona Ceramics"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  You can change this anytime in Settings.
                </p>
              </div>

              <Button
                size="lg"
                className="mt-8 w-full rounded-full sm:w-auto"
                disabled={!storeName.trim() || isPending}
                onClick={goToStep1}
              >
                {isPending ? "Saving…" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <h2 className="font-display text-2xl font-medium tracking-tight sm:text-4xl">
                Where do you sell today?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
                Pick as many as apply — this just helps us point you to the right tools first.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {channels.map((channel) => {
                  const isSelected = selectedChannels.has(channel.id);
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => toggleChannel(channel.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors",
                        isSelected
                          ? "border-primary bg-accent text-accent-foreground"
                          : "border-border-strong bg-card hover:bg-accent/50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
                        )}
                      >
                        {isSelected ? <Check className="h-4 w-4" /> : <channel.icon className="h-4 w-4" />}
                      </span>
                      <span className="text-sm font-medium">{channel.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <Button size="lg" variant="ghost" className="rounded-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button size="lg" className="rounded-full px-6" onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-display mt-5 text-2xl font-medium tracking-tight sm:text-4xl">
                {storeName} is ready.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
                {primaryChannel
                  ? `Add your first product and we'll score it against what ${primaryChannel.label} expects.`
                  : "Add your first product to see your channel readiness score."}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="w-full rounded-full sm:w-auto" asChild>
                  <Link href="/products">
                    Add your first product
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="w-full rounded-full sm:w-auto" asChild>
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
