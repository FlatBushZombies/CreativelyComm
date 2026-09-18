import { isGoogleAuthConfigured } from "@/lib/auth/auth";
import { LoginClient } from "./login-client";

export default function LoginPage() {
  return <LoginClient googleConfigured={isGoogleAuthConfigured()} />;
}
