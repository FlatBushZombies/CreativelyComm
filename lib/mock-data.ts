export type ProductStatus = "optimized" | "pending" | "draft" | "published";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  images: string[];
  optimizedImages: string[];
  sku: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  exports: number;
}

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

export const products: Product[] = [
  {
    id: "1",
    name: "Artisan Ceramic Mug",
    description:
      "Handcrafted ceramic mug with a matte glaze finish. Perfect for morning coffee or evening tea. Microwave and dishwasher safe.",
    price: 34.99,
    category: "Home & Kitchen",
    status: "optimized",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    ],
    optimizedImages: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80&bg=white",
      "https://images.unsplash.com/photo-1577873859163-8e7c4b4b4b4b?w=800&q=80",
    ],
    sku: "ACM-001",
    tags: ["ceramic", "handmade", "kitchen"],
    createdAt: "2026-03-15",
    updatedAt: "2026-03-28",
    views: 1247,
    exports: 5,
  },
  {
    id: "2",
    name: "Minimalist Leather Wallet",
    description:
      "Slim bifold wallet crafted from full-grain vegetable-tanned leather. RFID blocking technology included.",
    price: 68.0,
    category: "Accessories",
    status: "published",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
    ],
    optimizedImages: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
    ],
    sku: "MLW-002",
    tags: ["leather", "wallet", "minimalist"],
    createdAt: "2026-03-10",
    updatedAt: "2026-03-25",
    views: 892,
    exports: 7,
  },
  {
    id: "3",
    name: "Organic Cotton Tote Bag",
    description:
      "Eco-friendly tote bag made from 100% organic cotton. Reinforced handles and spacious interior.",
    price: 28.5,
    category: "Bags",
    status: "optimized",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    ],
    optimizedImages: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    ],
    sku: "OCT-003",
    tags: ["organic", "eco", "tote"],
    createdAt: "2026-03-18",
    updatedAt: "2026-03-27",
    views: 634,
    exports: 3,
  },
  {
    id: "4",
    name: "Wireless Earbuds Pro",
    description:
      "Premium wireless earbuds with active noise cancellation, 32-hour battery life, and crystal-clear audio.",
    price: 149.99,
    category: "Electronics",
    status: "pending",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
    ],
    optimizedImages: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
    ],
    sku: "WEP-004",
    tags: ["electronics", "audio", "wireless"],
    createdAt: "2026-03-20",
    updatedAt: "2026-03-29",
    views: 2103,
    exports: 2,
  },
  {
    id: "5",
    name: "Scented Soy Candle Set",
    description:
      "Set of three hand-poured soy candles in lavender, eucalyptus, and sandalwood scents. 45-hour burn time each.",
    price: 42.0,
    category: "Home & Living",
    status: "draft",
    images: [
      "https://images.unsplash.com/photo-1602607628347-0a0b0b0b0b0b?w=800&q=80",
    ],
    optimizedImages: [
      "https://images.unsplash.com/photo-1602874801006-938fa9d0dfbc?w=800&q=80",
    ],
    sku: "SSC-005",
    tags: ["candles", "home", "gift"],
    createdAt: "2026-03-22",
    updatedAt: "2026-03-30",
    views: 421,
    exports: 0,
  },
  {
    id: "6",
    name: "Stainless Steel Water Bottle",
    description:
      "Double-wall insulated water bottle keeps drinks cold 24hrs or hot 12hrs. BPA-free, leak-proof lid.",
    price: 32.99,
    category: "Outdoor",
    status: "optimized",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    ],
    optimizedImages: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
    ],
    sku: "SSW-006",
    tags: ["outdoor", "hydration", "eco"],
    createdAt: "2026-03-12",
    updatedAt: "2026-03-26",
    views: 1567,
    exports: 4,
  },
];

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

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
