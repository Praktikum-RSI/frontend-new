"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import type { Role } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: Role;
  loginPath?: string;
  forbiddenPath?: string;
}

export function AuthGuard({
  children,
  requireRole,
  loginPath = "/login",
  forbiddenPath = "/",
}: AuthGuardProps) {
  const { session, hydrated } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      const next = encodeURIComponent(pathname ?? "/");
      router.replace(`${loginPath}?next=${next}`);
      return;
    }
    if (requireRole && session.role !== requireRole) {
      router.replace(forbiddenPath);
    }
  }, [hydrated, session, requireRole, router, pathname, loginPath, forbiddenPath]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;
  if (requireRole && session.role !== requireRole) return null;

  return <>{children}</>;
}
