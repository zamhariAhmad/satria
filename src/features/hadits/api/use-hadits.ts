"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  haditsByKitabSchema,
  haditsSchema,
  haditsSearchSchema,
  kitabListSchema,
  type Hadits,
  type HaditsByKitab,
  type HaditsSearch,
  type KitabList,
} from "@/features/hadits/schemas/hadits";

const SANUSI_BASE =
  process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_URL ?? "https://api.ahmadsanusi.com/v1";
const SANUSI_API_KEY = process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_KEY ?? "";

type SanusiResponse = {
  status?: string;
  data?: unknown;
  message?: string;
};

async function fetchHadits<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  init: RequestInit = {},
): Promise<T> {
  const url = `${SANUSI_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(SANUSI_API_KEY ? { "X-API-Key": SANUSI_API_KEY } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Hadits API error: ${res.status}`);
  }
  let json: SanusiResponse;
  try {
    json = (await res.json()) as SanusiResponse;
  } catch {
    throw new Error(`Hadits API returned non-JSON (${res.status})`);
  }
  if (!json?.status || json.data == null) {
    throw new Error(json?.message ?? `Hadits API: data tidak tersedia`);
  }
  const parsed = schema.safeParse(json.data);
  if (!parsed.success) {
    throw new Error(`Bentuk data hadits tidak sesuai: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const haditsKeys = {
  kitab: ["hadits", "kitab"] as const,
  daily: ["hadits", "daily"] as const,
  byKitab: (slug: string, page: number, limit: number) =>
    ["hadits", "kitab", slug, page, limit] as const,
  search: (q: string, kitab: string | null, page: number, limit: number) =>
    ["hadits", "search", q, kitab, page, limit] as const,
  detail: (slug: string, nomor: number) =>
    ["hadits", "detail", slug, nomor] as const,
};

export function useKitabList() {
  return useQuery({
    queryKey: haditsKeys.kitab,
    queryFn: () => fetchHadits<KitabList>("hadits", kitabListSchema),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useDailyHadits() {
  return useQuery({
    queryKey: haditsKeys.daily,
    queryFn: () => fetchHadits<Hadits>("hadits/daily", haditsSchema),
    staleTime: 1000 * 60 * 60 * 6,
  });
}

export type UseKitabHaditsParams = {
  slug: string | null | undefined;
  page?: number;
  limit?: number;
};

export function useKitabHadits({
  slug,
  page = 1,
  limit = 10,
}: UseKitabHaditsParams) {
  return useQuery({
    queryKey: haditsKeys.byKitab(slug ?? "", page, limit),
    enabled: !!slug,
    queryFn: () => {
      const url = `hadits/${slug}?page=${page}&limit=${limit}`;
      return fetchHadits<HaditsByKitab>(url, haditsByKitabSchema);
    },
    staleTime: 1000 * 60 * 30,
  });
}

export type UseSearchHaditsParams = {
  q: string;
  kitab?: string | null;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export function useSearchHadits({
  q,
  kitab = null,
  page = 1,
  limit = 10,
  enabled = true,
}: UseSearchHaditsParams) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: haditsKeys.search(trimmed.toLowerCase(), kitab, page, limit),
    enabled: enabled && trimmed.length >= 2,
    queryFn: () => {
      const search = new URLSearchParams();
      search.set("q", trimmed);
      if (kitab) search.set("kitab", kitab);
      search.set("page", String(page));
      search.set("limit", String(limit));
      const url = `hadits/search?${search.toString()}`;
      return fetchHadits<HaditsSearch>(url, haditsSearchSchema, { cache: "no-store" });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useHaditsDetail(slug: string | null, nomor: number | null) {
  return useQuery({
    queryKey: haditsKeys.detail(slug ?? "", nomor ?? 0),
    enabled: !!slug && !!nomor,
    queryFn: () =>
      fetchHadits<Hadits>(`hadits/${slug}/${nomor}`, haditsSchema),
    staleTime: 1000 * 60 * 60 * 24,
  });
}
