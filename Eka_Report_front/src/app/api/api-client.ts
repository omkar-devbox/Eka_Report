/// <reference types="vite/client" />

const BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || "http://localhost:8000"
  : "";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the 401 → silent refresh retry (used internally for the refresh call itself). */
  _skipRefresh?: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers — lazily imported to avoid circular deps at module load time
// ---------------------------------------------------------------------------
function getStore() {
  // Dynamic import of the zustand store so this module can be used before
  // React initialises.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).__ekaAuthStore as
    | { accessToken: string | null; setAccessToken: (t: string) => void; clearAuth: () => void }
    | undefined;
}

/** Expose the store on window so api-client can reach it without circular imports. */
export function bindAuthStore(store: {
  accessToken: string | null;
  setAccessToken: (t: string) => void;
  clearAuth: () => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__ekaAuthStore = store;
}

// ---------------------------------------------------------------------------
// Silent refresh
// ---------------------------------------------------------------------------
let _refreshPromise: Promise<string | null> | null = null;

async function silentRefresh(): Promise<string | null> {
  // Deduplicate concurrent 401s — only one refresh call goes out
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // sends HttpOnly refresh cookie
      });
      if (!res.ok) return null;
      const data = await res.json();
      const newToken: string = data.access_token;
      getStore()?.setAccessToken(newToken);
      return newToken;
    } catch {
      return null;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
export const apiClient = async <T>(
  endpoint: string,
  { body, _skipRefresh = false, ...customConfig }: RequestOptions = {},
): Promise<T> => {
  const store = getStore();
  const headers: Record<string, string> = {};

  // Inject Bearer token if present
  if (store?.accessToken) {
    headers["Authorization"] = `Bearer ${store.accessToken}`;
  }

  // Set Content-Type for JSON bodies (not FormData)
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method: body ? "POST" : "GET",
    ...customConfig,
    credentials: "include", // always include cookies (for refresh)
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // ---------------------------------------------------------------------------
  // 401 → try silent refresh once
  // ---------------------------------------------------------------------------
  if (response.status === 401 && !_skipRefresh) {
    const newToken = await silentRefresh();

    if (newToken) {
      // Retry the original request with the fresh token
      const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...config,
        headers: { ...retryHeaders, ...customConfig.headers },
      });
    } else {
      // Refresh failed → log out
      store?.clearAuth();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  // ---------------------------------------------------------------------------
  // Parse response
  // ---------------------------------------------------------------------------
  let data: unknown;
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = { message: "Unexpected response format" };
    }
  } else {
    try {
      data = await response.blob();
    } catch {
      data = response;
    }
  }

  if (response.ok) {
    return data as T;
  }

  const errorMessage =
    data && typeof data === "object" && "detail" in data
      ? (data as { detail: string }).detail
      : data && typeof data === "object" && "message" in data
        ? (data as { message: string }).message
        : "Something went wrong";

  throw new Error(errorMessage);
};
