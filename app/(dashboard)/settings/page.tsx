import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getOrCreateDefaultWorkspace } from "@/lib/workspace";
import { getWorkspaceMembers, getMemberRole } from "@/lib/team";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const workspace = await getOrCreateDefaultWorkspace(session.user.id, session.user.name);
  const [members, role] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getMemberRole(workspace.id, session.user.id),
  ]);

  return (
    <SettingsClient
      members={members}
      currentUserId={session.user.id}
      canManageTeam={role === "owner" || role === "admin"}
    />
  );
}
