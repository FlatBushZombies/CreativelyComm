"use client";

import { createContext, useContext } from "react";

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
