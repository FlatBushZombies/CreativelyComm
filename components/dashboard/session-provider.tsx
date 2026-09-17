"use client";

import { createContext, useContext, useEffect } from "react";
import posthog from "posthog-js";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface SessionWorkspace {
  id: string;
  name: string;
  slug: string;
}

interface SessionContextValue {
  user: SessionUser;
  workspace: SessionWorkspace;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  user,
  workspace,
  children,
}: SessionContextValue & { children: React.ReactNode }) {
  useEffect(() => {
    posthog.identify(user.id, {
      email: user.email,
      name: user.name,
    });
  }, [user.email, user.id, user.name]);

  useEffect(() => {
    // Rolls every event up to the workspace/account, not just the individual
    // user -- this is a B2B app, so workspace-level analytics (retention,
    // feature adoption per account) matter as much as per-user events.
    posthog.group("workspace", workspace.id, { name: workspace.name });
  }, [workspace.id, workspace.name]);

  return (
    <SessionContext.Provider value={{ user, workspace }}>{children}</SessionContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useCurrentUser must be used within a SessionProvider");
  return ctx.user;
}

export function useWorkspace() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useWorkspace must be used within a SessionProvider");
  return ctx.workspace;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
