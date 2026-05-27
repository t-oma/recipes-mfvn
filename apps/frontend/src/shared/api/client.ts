import { ApiError } from "./errors";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      raw = null;
    }
    const body =
      typeof raw === "object" &&
      raw !== null &&
      "error" in raw &&
      "code" in raw &&
      "status" in raw
        ? (raw as {
            error: string;
            code: string;
            status: number;
            details?: unknown;
          })
        : {
            error: "Unknown error",
            code: "UNKNOWN_ERROR",
            status: response.status,
          };
    throw new ApiError(response.status, response.statusText, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export interface ApiRequestOptions
  extends Omit<RequestInit, "body" | "method"> {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { query, body, headers, ...rest } = options;

  let url = `${import.meta.env.VITE_API_URL}${path}`;

  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) {
      url += `?${qs}`;
    }
  }

  const response = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return handleResponse<T>(response);
}
