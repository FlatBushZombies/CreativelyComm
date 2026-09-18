import { isGoogleAuthConfigured, isShopifyAuthConfigured } from "@/lib/auth/auth";
import { SignupClient } from "./signup-client";

export default function SignupPage() {
  return <SignupClient googleConfigured={isGoogleAuthConfigured()} shopifyConfigured={isShopifyAuthConfigured()} />;
}
