"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  ShoppingCart,
  Cpu,
  Megaphone,
  Radar,
  LogOut,
} from "lucide-react";
import posthog from "posthog-js";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, getInitials } from "@/components/dashboard/session-provider";
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown";
import { authClient } from "@/lib/auth/auth-client";

const navGroups = [
  {
    label: "Workflow",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/diagnostics", label: "What Changed", icon: Radar },
      { href: "/products", label: "Products", icon: Package },
      { href: "/readiness", label: "Readiness", icon: ShieldCheck },
      { href: "/export", label: "Export Center", icon: Download },
      { href: "/storefront", label: "Storefront", icon: Store },
    ],
  },
  {
    label: "Marketing",
    items: [{ href: "/campaigns", label: "Campaigns", icon: Megaphone }],
  },
  {
    label: "Sell",
    items: [
      { href: "/orders", label: "Orders", icon: ShoppingCart },
      { href: "/hardware", label: "Hardware", icon: Cpu },
    ],
  },
  {
    label: "Workspace",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

const navItems = navGroups.flatMap((group) => group.items);

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && <Logo size="sm" />}
          {collapsed && <Logo size="sm" showText={false} className="mx-auto" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-5 p-3">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgb(56_102_65_/_0.15)]"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="border-t border-border p-4">
            <p className="text-xs text-muted-foreground">Everything included — no usage caps.</p>
          </div>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex overflow-x-auto border-t border-border bg-card lg:hidden">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-16 shrink-0 flex-col items-center gap-1 py-2 text-[10px] font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function handleLogout(router: ReturnType<typeof useRouter>) {
  posthog.capture("user_logged_out");
  authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        // Unlinks future events from this identified user -- important if
        // this device/browser is ever shared, per PostHog's own guidance.
        posthog.reset();
        router.push("/login");
      },
    },
  });
}

export function DashboardHeader({ title, description }: { title: string; description?: string }) {
  const user = useCurrentUser();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="lg:hidden">
          <Logo size="sm" showText={false} />
        </div>
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="relative hidden sm:block w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-9" />
          </div>
          <NotificationsDropdown />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Account menu" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[14rem]">
              <DropdownMenuLabel className="truncate">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleLogout(router)} className="text-red-600 focus:text-red-600">
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 lg:hidden">
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </header>
  );
}
