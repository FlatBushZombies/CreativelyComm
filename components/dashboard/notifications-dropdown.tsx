"use client";

import { useEffect, useState } from "react";
import { Bell, Wand2, Download, Share2, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Activity } from "@/lib/activity";

const activityIcons = {
  optimize: Wand2,
  export: Download,
  publish: Share2,
  upload: Upload,
  share: Share2,
  import: FileSpreadsheet,
};

export function NotificationsDropdown() {
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : { activity: [] }))
      .then((data) => setActivity(data.activity ?? []))
      .catch(() => setActivity([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {activity.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!loaded ? (
          <p className="px-2.5 py-4 text-center text-sm text-muted-foreground">Loading...</p>
        ) : activity.length === 0 ? (
          <p className="px-2.5 py-4 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          activity.map((item) => {
            const Icon = activityIcons[item.type];
            return (
              <DropdownMenuItem key={item.id} className="flex-col items-start gap-0.5">
                <div className="flex w-full items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <p className="pl-6 text-xs text-muted-foreground">{item.description}</p>
                <div className="flex w-full items-center justify-between pl-6">
                  {item.productName && (
                    <Badge variant="muted" className="text-[10px]">
                      {item.productName}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
