"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { clearSession } from "@/lib/auth";

interface HeaderProps {
  variant?: "public" | "admin";
}

export function Header({ variant = "public" }: HeaderProps) {
  const router = useRouter();
  const { session, hydrated } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = () => {
    clearSession();
    setMenuOpen(false);
    router.push("/");
  };

  if (variant === "admin") {
    return (
      <header className="border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-sidebar-foreground">
            Admin Panel
          </h1>
          <div className="flex items-center gap-3" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-sidebar-accent transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                {(session?.role ?? "AD").charAt(0)}
              </div>
              <ChevronDown className="h-4 w-4 text-sidebar-foreground/70" />
            </button>
            {menuOpen && (
              <div className="absolute right-6 top-16 z-40 w-56 rounded-xl border border-border bg-background shadow-lg py-2">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-xs uppercase tracking-wider text-foreground/60">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {session?.role ?? "Admin"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-foreground">
          P!NGFEST
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/browse"
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            Browse Events
          </Link>
          <a
            href="#"
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="#"
            className="text-sm text-foreground hover:text-primary transition-colors"
          >
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!hydrated ? (
            <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
          ) : session ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {session.role.charAt(0)}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {session.role === "ADMIN" ? "Admin" : "Account"}
                </span>
                <ChevronDown className="h-4 w-4 text-foreground/60" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 z-40 w-56 rounded-xl border border-border bg-background shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-xs uppercase tracking-wider text-foreground/60">
                      Role
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {session.role}
                    </p>
                  </div>
                  {session.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/browse"
                    onClick={() => setMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <UserRound className="h-4 w-4" />
                    Browse Events
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
