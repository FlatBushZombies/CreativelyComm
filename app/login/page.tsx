import { isGoogleAuthConfigured, isShopifyAuthConfigured } from "@/lib/auth/auth";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  return <LoginClient googleConfigured={isGoogleAuthConfigured()} shopifyConfigured={isShopifyAuthConfigured()} />;
}
