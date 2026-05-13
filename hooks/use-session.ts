"use client";

import { useEffect, useState } from "react";
import {
  type AuthSession,
  SESSION_EVENT_NAME,
  getSession,
} from "@/lib/auth";

export function useSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setHydrated(true);

    const refresh = () => setSession(getSession());
    const onStorage = (e: StorageEvent) => {
      if (e.key === "access_token" || e.key === null) refresh();
    };
    window.addEventListener(SESSION_EVENT_NAME, refresh);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SESSION_EVENT_NAME, refresh);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return { session, hydrated };
}
