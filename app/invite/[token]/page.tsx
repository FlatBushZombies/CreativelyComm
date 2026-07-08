import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { acceptInvite } from "@/lib/team";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`);
  }

  const membership = await acceptInvite(token, session.user.id);

  if (!membership) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-medium">Invite not found</h1>
          <p className="mt-2 text-muted-foreground">
            This invite link is invalid or has already been used.
          </p>
        </div>
      </div>
    );
  }

  redirect("/dashboard");
}
