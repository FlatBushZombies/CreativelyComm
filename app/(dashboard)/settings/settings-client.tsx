"use client";

import { useState } from "react";
import { Upload, Palette, Globe, Bell, CreditCard, Users, Copy, Check, Trash2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/shared/fade-in";
import type { WorkspaceMember, WorkspaceRole } from "@/lib/team";
import type { Workspace } from "@/lib/workspace";
import { inviteTeamMember, removeTeamMember, saveBrandingAction } from "./actions";

const colorPresets = [
  "#386641",
  "#1a1a2e",
  "#2d3436",
  "#6c5ce7",
  "#e17055",
  "#00b894",
];

const roleOptions: { value: WorkspaceRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

function CopyInviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/invite/${token}` : `/invite/${token}`;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      Copy invite link
    </Button>
  );
}

interface SettingsClientProps {
  workspace: Workspace;
  members: WorkspaceMember[];
  currentUserId: string;
  canManageTeam: boolean;
}

export function SettingsClient({ workspace, members, currentUserId, canManageTeam }: SettingsClientProps) {
  const [brandColor, setBrandColor] = useState(workspace.brandColor);
  const [storeName, setStoreName] = useState(workspace.storeName || workspace.name);
  const [storeTagline, setStoreTagline] = useState(workspace.storeTagline || "");
  const [hideBranding, setHideBranding] = useState(workspace.hideBranding);
  const [customDomain, setCustomDomain] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [exportNotifications, setExportNotifications] = useState(true);

  return (
    <>
      <DashboardHeader
        title="Settings"
        description="Customize your branding and store preferences"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
        <FadeIn>
          <Tabs defaultValue="team">
            <TabsList className="mb-6">
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="space-y-6">
              {canManageTeam && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Invite a teammate
                    </CardTitle>
                    <CardDescription>
                      Sends no email — you&apos;ll get a shareable invite link to send yourself.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={inviteTeamMember} className="flex flex-col gap-3 sm:flex-row">
                      <Input
                        name="email"
                        type="email"
                        placeholder="teammate@company.com"
                        required
                        className="flex-1"
                      />
                      <select
                        name="role"
                        defaultValue="editor"
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <Button type="submit">Send Invite</Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Members</CardTitle>
                  <CardDescription>{members.length} people in this workspace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.name ?? member.email}
                          {member.userId === currentUserId && (
                            <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                          )}
                        </p>
                        {member.name && (
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{member.role}</Badge>
                        <Badge variant={member.status === "active" ? "success" : "warning"}>
                          {member.status}
                        </Badge>
                        {member.status === "pending" && member.inviteToken && (
                          <CopyInviteLink token={member.inviteToken} />
                        )}
                        {canManageTeam && member.role !== "owner" && member.userId !== currentUserId && (
                          <form action={removeTeamMember}>
                            <input type="hidden" name="memberId" value={member.id} />
                            <Button variant="ghost" size="icon" type="submit" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Brand Identity
                  </CardTitle>
                  <CardDescription>
                    Customize how your brand appears across storefronts and exports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={saveBrandingAction} className="space-y-6">
                    <input type="hidden" name="brandColor" value={brandColor} />
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="flex h-24 w-24 items-center justify-center rounded-xl text-white text-2xl font-bold"
                          style={{ backgroundColor: brandColor }}
                        >
                          {(storeName || "CC").slice(0, 2).toUpperCase()}
                        </div>
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-3 w-3" />
                          Upload Logo
                        </Button>
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label htmlFor="brandName">Brand Name</Label>
                          <Input
                            id="brandName"
                            name="storeName"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tagline">Tagline</Label>
                          <Input
                            id="tagline"
                            name="storeTagline"
                            value={storeTagline}
                            onChange={(e) => setStoreTagline(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Primary Brand Color</Label>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {colorPresets.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setBrandColor(color)}
                            className="h-10 w-10 rounded-lg border-2 transition-all hover:scale-110"
                            style={{
                              backgroundColor: color,
                              borderColor: brandColor === color ? color : "transparent",
                              boxShadow: brandColor === color ? `0 0 0 2px white, 0 0 0 4px ${color}` : "none",
                            }}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                        <Input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="h-10 w-14 cursor-pointer p-1"
                        />
                        <Input
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="w-28 font-mono text-sm"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">White-label storefront</p>
                        <p className="text-xs text-muted-foreground">
                          Hide the &quot;Powered by CreativelyComm&quot; footer on your public store,
                          product pages, and embed widget
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        name="hideBranding"
                        checked={hideBranding}
                        onChange={() => {}}
                        className="sr-only"
                      />
                      <Switch checked={hideBranding} onCheckedChange={setHideBranding} />
                    </div>

                    <Button type="submit">Save Branding</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="store" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Store Customization
                  </CardTitle>
                  <CardDescription>
                    Configure your online storefront settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="storeUrl">Store URL</Label>
                    <div className="mt-1.5 flex">
                      <span className="inline-flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        creativelycomm.com/store/
                      </span>
                      <Input
                        id="storeUrl"
                        defaultValue="artisan-co"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customDomain">Custom Domain</Label>
                    <Input
                      id="customDomain"
                      placeholder="shop.yourbrand.com"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Available on Growth and Enterprise plans
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Show product ratings</p>
                        <p className="text-xs text-muted-foreground">Display star ratings on product cards</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Enable cart</p>
                        <p className="text-xs text-muted-foreground">Allow customers to add items to cart</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Show &quot;Powered by&quot; badge</p>
                        <p className="text-xs text-muted-foreground">Display CreativelyComm branding in footer</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Button>Save Store Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email notifications</p>
                      <p className="text-xs text-muted-foreground">Receive updates about your account</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Export completion alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified when exports finish</p>
                    </div>
                    <Switch
                      checked={exportNotifications}
                      onCheckedChange={setExportNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Weekly digest</p>
                      <p className="text-xs text-muted-foreground">Summary of store performance and activity</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-primary/20 bg-accent/50 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">Growth Plan</p>
                        <p className="text-sm text-muted-foreground">$79/month · Renews April 1, 2026</p>
                      </div>
                      <Button variant="outline">Change Plan</Button>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid gap-4 sm:grid-cols-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Products</p>
                        <p className="font-medium">24 / 500</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">AI Optimizations</p>
                        <p className="font-medium">Unlimited</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Storefronts</p>
                        <p className="font-medium">1 / 3</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </FadeIn>
      </div>
    </>
  );
}
