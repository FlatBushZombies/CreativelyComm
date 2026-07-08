import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SessionProvider } from "@/components/dashboard/session-provider";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);

  return (
    <SessionProvider
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      workspace={{ id: workspace.id, name: workspace.name }}
    >
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col pb-16 lg:pb-0">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}
