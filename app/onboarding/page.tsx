import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { SessionProvider } from "@/components/dashboard/session-provider";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const firstName = session.user.name.split(" ")[0];

  return (
    <SessionProvider
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      workspace={{ id: workspace.id, name: workspace.name, slug: workspace.slug }}
    >
      <OnboardingClient
        firstName={firstName}
        initialStoreName={workspace.storeName || workspace.name}
      />
    </SessionProvider>
  );
}
