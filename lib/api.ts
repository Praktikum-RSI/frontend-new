export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type FetchInit = Omit<RequestInit, "method" | "body"> & {
  body?: unknown;
  auth?: boolean;
};

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("access_token") ??
    readCookie("access_token") ??
    null
  );
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)",
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

async function request<T>(method: string, path: string, init: FetchInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (init.auth !== false) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path), {
    method,
    credentials: "include",
    ...init,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export const api = {
  get: <T>(path: string, init?: FetchInit) => request<T>("GET", path, init),
  post: <T>(path: string, body?: unknown, init?: FetchInit) =>
    request<T>("POST", path, { ...init, body }),
  put: <T>(path: string, body?: unknown, init?: FetchInit) =>
    request<T>("PUT", path, { ...init, body }),
  patch: <T>(path: string, body?: unknown, init?: FetchInit) =>
    request<T>("PATCH", path, { ...init, body }),
  remove: <T>(path: string, init?: FetchInit) => request<T>("DELETE", path, init),
};
