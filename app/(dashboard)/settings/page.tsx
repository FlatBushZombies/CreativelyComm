"use client";

import { useState } from "react";
import { Upload, Palette, Globe, Bell, CreditCard } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/shared/fade-in";

const colorPresets = [
  "#386641",
  "#1a1a2e",
  "#2d3436",
  "#6c5ce7",
  "#e17055",
  "#00b894",
];

export default function SettingsPage() {
  const [brandColor, setBrandColor] = useState("#386641");
  const [storeName, setStoreName] = useState("Artisan Co.");
  const [storeTagline, setStoreTagline] = useState("Handcrafted with love");
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
          <Tabs defaultValue="branding">
            <TabsList className="mb-6">
              <TabsTrigger value="branding">Branding</TabsTrigger>
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

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
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="flex h-24 w-24 items-center justify-center rounded-xl text-white text-2xl font-bold"
                        style={{ backgroundColor: brandColor }}
                      >
                        AC
                      </div>
                      <Button variant="outline" size="sm">
                        <Upload className="h-3 w-3" />
                        Upload Logo
                      </Button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                          id="brandName"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                          id="tagline"
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

                  <Button>Save Branding</Button>
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
