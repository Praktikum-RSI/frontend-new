export type Role = "ADMIN" | "USER" | string;

export interface AuthSession {
  accountId: string;
  role: Role;
  token: string;
  expiresAt: number | null;
}

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const SESSION_EVENT = "auth-session-changed";

interface JwtPayload {
  account_id?: string;
  role_name?: string;
  ability?: string;
  exp?: number;
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4;
  const padded = pad ? input + "=".repeat(4 - pad) : input;
  const normalized = padded.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") return atob(normalized);
  return Buffer.from(normalized, "base64").toString("binary");
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const raw = base64UrlDecode(parts[1]);
    const json = decodeURIComponent(
      Array.from(raw)
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getSession(): AuthSession | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload?.account_id || !payload?.role_name) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    clearSession();
    return null;
  }
  return {
    accountId: payload.account_id,
    role: payload.role_name,
    token,
    expiresAt: payload.exp ? payload.exp * 1000 : null,
  };
}

export function setSession(accessToken: string, refreshToken?: string): AuthSession | null {
  if (typeof window === "undefined") return null;
  window.localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
  window.dispatchEvent(new Event(SESSION_EVENT));
  return getSession();
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function isAdmin(session: AuthSession | null): boolean {
  return session?.role === "ADMIN";
}

export function isAuthenticated(session: AuthSession | null): boolean {
  return Boolean(session);
}

export const SESSION_EVENT_NAME = SESSION_EVENT;
