import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const firstName = session.user.name.split(" ")[0];

  return (
    <OnboardingClient
      firstName={firstName}
      initialStoreName={workspace.storeName || workspace.name}
    />
  );
}
