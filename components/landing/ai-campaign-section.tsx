import Image from "next/image";
import { ArrowRight, Package, Sparkles, Pencil, Send } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/landing/section-heading";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: Package,
    label: "Choose product",
    body: (
      <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background p-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md">
          <Image
            src="https://images.pexels.com/photos/3993398/pexels-photo-3993398.jpeg?auto=compress&cs=tinysrgb&w=100"
            alt=""
            fill
            className="object-cover"
            sizes="36px"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">Ceramic Vanity Set</p>
          <p className="text-[11px] text-muted-foreground">$28.00</p>
        </div>
      </div>
    ),
  },
  {
    icon: Sparkles,
    label: "Generate campaign",
    body: (
      <div className="space-y-1.5">
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-[10px]">Sales</Badge>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <SiInstagram className="h-2.5 w-2.5" />
            Instagram
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground w-fit">
          <Sparkles className="h-3 w-3" />
          Generating…
        </div>
      </div>
    ),
  },
  {
    icon: Pencil,
    label: "Edit every field",
    body: (
      <div className="space-y-1.5 rounded-lg border border-border bg-background p-2.5">
        <p className="text-[11px] leading-snug">&ldquo;Handmade ceramics that make mornings feel intentional.&rdquo;</p>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">Shorten</span>
          <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">More persuasive</span>
        </div>
      </div>
    ),
  },
  {
    icon: Send,
    label: "Preview & publish",
    body: (
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="relative aspect-[4/3]">
          <Image
            src="https://images.pexels.com/photos/3993398/pexels-photo-3993398.jpeg?auto=compress&cs=tinysrgb&w=300"
            alt=""
            fill
            className="object-cover"
            sizes="200px"
          />
        </div>
        <p className="p-2 text-[10px] text-muted-foreground">#handmade #ceramics #shopsmall</p>
      </div>
    ),
  },
];

export function AICampaignSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="AI-powered marketing"
          title="Turn any product into a ready-to-post campaign."
          description="Pick a product, choose a channel and objective, and get real headline copy, captions, hashtags, and an email or WhatsApp message — every field editable before you publish."
        />

        <StaggerContainer className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <StaggerItem key={step.label} className="relative">
              <div className="h-full rounded-2xl border border-border-strong bg-card p-4 card-shadow">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <step.icon className="h-3.5 w-3.5 text-primary" />
                  {step.label}
                </div>
                <div className="mt-3">{step.body}</div>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground/50 lg:block" />
              )}
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.15} className="mt-6">
          <p className="text-center text-xs text-muted-foreground">
            Real product, real AI generation, fully editable before it ever goes live — not a mockup.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
