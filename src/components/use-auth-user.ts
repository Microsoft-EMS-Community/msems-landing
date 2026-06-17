"use client";

import { useCallback, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  username: string;
  avatar: string | null;
}

/**
 * Reads the current verified Discord identity from /api/auth/me.
 * `user` is undefined while loading, null when logged out.
 */
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user?: AuthUser | null }) => {
        if (alive) setUser(d.user ?? null);
      })
      .catch(() => {
        if (alive) setUser(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  return { user, logout };
}

/** Build a login URL that returns to the current page and reopens `hash`. */
export function loginHref(hash: string): string {
  if (typeof window === "undefined") return "/api/auth/discord";
  const returnTo = window.location.pathname + hash;
  return `/api/auth/discord?return_to=${encodeURIComponent(returnTo)}`;
}
