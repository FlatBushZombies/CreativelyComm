export interface Activity {
  id: string;
  type: "optimize" | "export" | "publish" | "upload" | "share";
  title: string;
  description: string;
  timestamp: string;
  productName?: string;
}

export interface ExportFormat {
  id: string;
  name: string;
  platform: string;
  description: string;
  icon: string;
  status: "ready" | "pending" | "exported";
  lastExported?: string;
  productCount: number;
}

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export const activities: Activity[] = [
  {
    id: "1",
    type: "optimize",
    title: "AI optimization complete",
    description: "Background removed and lighting enhanced for 4 images",
    timestamp: "2 hours ago",
    productName: "Artisan Ceramic Mug",
  },
  {
    id: "2",
    type: "export",
    title: "Exported to Shopify",
    description: "Product feed generated with 12 optimized images",
    timestamp: "5 hours ago",
    productName: "Minimalist Leather Wallet",
  },
  {
    id: "3",
    type: "publish",
    title: "Storefront updated",
    description: "3 new products added to your branded store",
    timestamp: "Yesterday",
  },
  {
    id: "4",
    type: "upload",
    title: "New product uploaded",
    description: "Wireless Earbuds Pro added to library",
    timestamp: "Yesterday",
    productName: "Wireless Earbuds Pro",
  },
  {
    id: "5",
    type: "share",
    title: "Store link shared",
    description: "Shareable storefront link copied to clipboard",
    timestamp: "2 days ago",
  },
  {
    id: "6",
    type: "export",
    title: "Amazon listing prepared",
    description: "A+ content and main images formatted for Amazon",
    timestamp: "3 days ago",
    productName: "Stainless Steel Water Bottle",
  },
];

export const dashboardStats: DashboardStat[] = [
  { label: "Total Products", value: "24", change: "+3 this week", trend: "up" },
  { label: "Images Optimized", value: "186", change: "+42 this month", trend: "up" },
  { label: "Store Views", value: "4.2K", change: "+18% vs last month", trend: "up" },
  { label: "Exports", value: "31", change: "Across 7 platforms", trend: "neutral" },
];

export const exportFormats: ExportFormat[] = [
  {
    id: "shopify",
    name: "Shopify",
    platform: "Shopify",
    description: "CSV product feed with optimized images and metafields",
    icon: "shopify",
    status: "exported",
    lastExported: "2026-03-28",
    productCount: 18,
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    platform: "WooCommerce",
    description: "WordPress-compatible product XML with media attachments",
    icon: "woocommerce",
    status: "ready",
    lastExported: "2026-03-25",
    productCount: 15,
  },
  {
    id: "etsy",
    name: "Etsy",
    platform: "Etsy",
    description: "Listing format with tags, materials, and shipping profiles",
    icon: "etsy",
    status: "ready",
    productCount: 12,
  },
  {
    id: "amazon",
    name: "Amazon",
    platform: "Amazon",
    description: "Seller Central flat file with A+ content images",
    icon: "amazon",
    status: "exported",
    lastExported: "2026-03-27",
    productCount: 8,
  },
  {
    id: "google",
    name: "Google Merchant",
    platform: "Google",
    description: "Product feed for Google Shopping and Performance Max",
    icon: "google",
    status: "ready",
    productCount: 20,
  },
  {
    id: "facebook",
    name: "Facebook Catalog",
    platform: "Meta",
    description: "Catalog feed for Facebook and Instagram Shops",
    icon: "facebook",
    status: "pending",
    productCount: 16,
  },
  {
    id: "tiktok",
    name: "TikTok Shop",
    platform: "TikTok",
    description: "Product listings optimized for TikTok commerce",
    icon: "tiktok",
    status: "ready",
    productCount: 10,
  },
];

export const aiFeatures = [
  {
    id: "bg-removal",
    name: "Background Removal",
    description: "Instantly remove backgrounds with pixel-perfect edges",
    icon: "scissors",
  },
  {
    id: "lighting",
    name: "Lighting Enhancement",
    description: "Auto-adjust exposure, shadows, and highlights",
    icon: "sun",
  },
  {
    id: "upscale",
    name: "AI Upscale",
    description: "Enhance resolution up to 4x without quality loss",
    icon: "maximize",
  },
  {
    id: "lifestyle",
    name: "Lifestyle Backgrounds",
    description: "Place products in stunning lifestyle scenes",
    icon: "image",
  },
  {
    id: "white-bg",
    name: "White Background",
    description: "Generate marketplace-ready pure white backgrounds",
    icon: "square",
  },
];

export const pricingPlans = [
  {
    name: "Starter",
    price: 29,
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 50 products",
      "100 AI optimizations/month",
      "1 storefront",
      "3 export platforms",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    price: 79,
    description: "For growing brands scaling across channels",
    features: [
      "Up to 500 products",
      "Unlimited AI optimizations",
      "3 storefronts",
      "All export platforms",
      "Priority support",
      "Custom branding",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 199,
    description: "For large teams with advanced needs",
    features: [
      "Unlimited products",
      "Unlimited everything",
      "Unlimited storefronts",
      "API access",
      "Dedicated account manager",
      "SSO & advanced security",
    ],
    highlighted: false,
  },
];
