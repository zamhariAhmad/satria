import { env } from "@/config/env";
import { mockReady } from "@/lib/mock-ready";

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
};

export type ApiEnvelope<T> = {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      perPage: number;
      total: number;
    };
  };
  error: ApiError | null;
};

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${env.apiBaseUrl}${path}`,
  );
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  // Wait for MSW to install before issuing the first request, so mocked
  // endpoints aren't bypassed during initial render.
  if (env.useMock && typeof window !== "undefined") {
    await mockReady.promise;
  }

  const { query, headers, ...rest } = options;
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
  });

  const text = await res.text();
  const json = (text ? JSON.parse(text) : {}) as ApiEnvelope<T>;

  if (!res.ok || json.error) {
    const err: ApiError = json.error ?? {
      code: `HTTP_${res.status}`,
      message: res.statusText || "Request failed",
    };
    throw err;
  }

  return json.data;
}
