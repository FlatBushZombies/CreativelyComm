"use client";

import { useState } from "react";
import Image from "next/image";
import { SiShopify, SiEtsy, SiGoogle, SiFacebook, SiTiktok } from "react-icons/si";
import { FaAmazon } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const previewRows = [
  {
    name: "Ceramic Vanity Set",
    price: "$28.00",
    image: "https://images.pexels.com/photos/3993398/pexels-photo-3993398.jpeg?auto=compress&cs=tinysrgb&w=100",
    readiness: "96% ready",
    channels: [SiShopify, FaAmazon, SiEtsy],
  },
  {
    name: "Handwoven Leather Tote",
    price: "$64.00",
    note: "Missing tags — blocks Etsy",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&q=80",
    readiness: "Needs review",
    channels: [SiShopify, SiEtsy],
    ready: false,
  },
];

const exportChannels = [
  { name: "Shopify", icon: SiShopify, status: "Exported" as const },
  { name: "Amazon", icon: FaAmazon, status: "Exported" as const },
  { name: "Etsy", icon: SiEtsy, status: "Ready" as const },
  { name: "Google", icon: SiGoogle, status: "Ready" as const },
  { name: "Meta", icon: SiFacebook, status: "Pending" as const },
  { name: "TikTok", icon: SiTiktok, status: "Ready" as const },
];

export function HeroMockup() {
  const [tab, setTab] = useState<"readiness" | "export">("readiness");

  return (
    <div className="overflow-hidden rounded-2xl border border-border-strong bg-card text-left card-shadow-lg">
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="ml-3 hidden text-xs font-medium text-muted-foreground sm:inline">Product Library</span>
        <div className="ml-auto flex gap-0.5 rounded-lg bg-muted p-0.5">
          <button
            type="button"
            onClick={() => setTab("readiness")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              tab === "readiness" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Readiness
          </button>
          <button
            type="button"
            onClick={() => setTab("export")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              tab === "export" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Export
          </button>
        </div>
      </div>

      {tab === "readiness" ? (
        <div className="divide-y divide-border">
          {previewRows.map((row) => (
            <div
              key={row.name}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40 sm:gap-4 sm:px-6"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                <Image src={row.image} alt="" fill className="object-cover" sizes="44px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{row.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.price}
                  {row.note ? ` · ${row.note}` : ""}
                </p>
              </div>
              <Badge variant={row.ready === false ? "muted" : "success"} className="hidden shrink-0 sm:inline-flex">
                {row.readiness}
              </Badge>
              <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                {row.channels.map((Icon, i) => (
                  <Icon key={i} className="h-3.5 w-3.5 text-foreground/50" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-px bg-border sm:grid-cols-6">
          {exportChannels.map(({ name, icon: Icon, status }) => (
            <div
              key={name}
              className="flex flex-col items-center gap-1.5 bg-card px-2 py-4 text-center transition-colors hover:bg-accent/40"
            >
              <Icon className="h-4 w-4 text-foreground/70" />
              <span className="text-[11px] font-medium">{name}</span>
              <Badge variant={status === "Pending" ? "muted" : "success"} className="text-[10px]">
                {status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
