import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ActivityType = "upload" | "optimize" | "export" | "publish" | "share" | "import";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  productName?: string;
}

interface ActivityLogRow {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  product_name: string | null;
  created_at: string;
}

function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return new Date(isoDate).toLocaleDateString();
}

/** Fire-and-forget style — callers don't need to await error handling beyond a log. */
export async function logActivity(
  workspaceId: string,
  input: { type: ActivityType; title: string; description: string; productName?: string }
): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("activity_log").insert({
    workspace_id: workspaceId,
    type: input.type,
    title: input.title,
    description: input.description,
    product_name: input.productName ?? null,
  });

  if (error) {
    console.error("Failed to log activity:", error.message);
  }
}

export async function getRecentActivity(workspaceId: string, limit = 10): Promise<Activity[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load activity: ${error.message}`);
  }

  return (data as ActivityLogRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: timeAgo(row.created_at),
    productName: row.product_name ?? undefined,
  }));
}
