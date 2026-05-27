import { ApiError } from "./errors";

export type Primitive = string | number | boolean | null | undefined;
export type QueryParams = Record<string, Primitive | Primitive[]>;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  withAuth?: boolean;
  skipAuthRefresh?: boolean;
  credentials?: RequestCredentials;
};

type AuthBridge = {
  getAccessToken: () => string | null;
  refresh: () => Promise<{ token: string } | null>;
  clearSession: () => void;
};

function buildUrl(baseURL: string, path: string, query?: QueryParams) {
  const url = new URL(baseURL);
  const basePath = url.pathname.replace(/\/+$/, ""); // /api → /api
  const cleanPath = path.replace(/^\/+/, ""); // /auth/login → auth/login
  url.pathname = `${basePath}/${cleanPath}`;

  if (!query) return url.toString();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined)
          url.searchParams.append(key, String(item));
      }
      continue;
    }

    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.startsWith("text/")) {
    return response.text();
  }

  return response.blob();
}

class HttpClient {
  private readonly baseURL: string;
  private authBridge: AuthBridge | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthBridge(authBridge: AuthBridge) {
    this.authBridge = authBridge;
  }

  async request<T>(
    path: string,
    {
      method = "GET",
      query,
      body,
      headers,
      signal,
      withAuth = true,
      skipAuthRefresh = false,
      credentials = "include",
    }: RequestOptions = {},
    isRetry = false,
  ): Promise<T> {
    const requestHeaders = new Headers(headers);
    const token = withAuth ? this.authBridge?.getAccessToken() : null;

    if (!requestHeaders.has("Accept")) {
      requestHeaders.set("Accept", "application/json");
    }

    let requestBody: BodyInit | undefined;

    if (body != null) {
      if (typeof FormData !== "undefined" && body instanceof FormData) {
        requestBody = body;
      } else {
        if (!requestHeaders.has("Content-Type")) {
          requestHeaders.set("Content-Type", "application/json");
        }
        requestBody = JSON.stringify(body);
      }
    }

    if (token && (withAuth || !requestHeaders.has("Authorization"))) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(buildUrl(this.baseURL, path, query), {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
      credentials,
    });

    if (
      response.status === 401 &&
      withAuth &&
      !skipAuthRefresh &&
      !isRetry &&
      this.authBridge
    ) {
      const newAccessToken = await this.refreshAccessToken();
      if (newAccessToken) {
        return this.request<T>(
          path,
          {
            method,
            query,
            body,
            headers,
            signal,
            withAuth,
            skipAuthRefresh,
            credentials,
          },
          true,
        );
      }
    }

    const data = await parseResponse(response);

    if (!response.ok) {
      const body =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        "code" in data
          ? (data as {
              error: string;
              code: string;
              details?: unknown;
            })
          : {
              error: "Unknown error",
              code: "UNKNOWN_ERROR",
            };

      throw new ApiError(response.status, response.statusText, body);
    }

    return data as T;
  }

  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, options?: Omit<RequestOptions, "method">) {
    return this.request<T>(path, { ...options, method: "POST" });
  }

  put<T>(path: string, options?: Omit<RequestOptions, "method">) {
    return this.request<T>(path, { ...options, method: "PUT" });
  }

  patch<T>(path: string, options?: Omit<RequestOptions, "method">) {
    return this.request<T>(path, { ...options, method: "PATCH" });
  }

  delete<T = void>(
    path: string,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  private async refreshAccessToken() {
    if (!this.authBridge) return null;

    if (!this.refreshPromise) {
      this.refreshPromise = this.authBridge
        .refresh()
        .then((result) => result?.token ?? null)
        .catch(() => {
          this.authBridge?.clearSession();
          return null;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    }

    return this.refreshPromise;
  }
}

export const http = new HttpClient(import.meta.env.VITE_API_URL);
