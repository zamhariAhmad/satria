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

type Envelope<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

async function fetchHadits<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T> {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  const text = await res.text();
  let json: Envelope<unknown>;
  try {
    json = text
      ? (JSON.parse(text) as Envelope<unknown>)
      : { data: null, error: null };
  } catch {
    throw new Error(`Hadits proxy returned non-JSON (${res.status})`);
  }
  if (!res.ok || json.error || json.data == null) {
    throw new Error(json.error?.message ?? `Hadits proxy error: ${res.status}`);
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
    queryFn: () => fetchHadits<KitabList>("/api/hadits", kitabListSchema),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useDailyHadits() {
  return useQuery({
    queryKey: haditsKeys.daily,
    queryFn: () => fetchHadits<Hadits>("/api/hadits/daily", haditsSchema),
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
      const url = `/api/hadits/${slug}?page=${page}&limit=${limit}`;
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
      const url = `/api/hadits/search?${search.toString()}`;
      return fetchHadits<HaditsSearch>(url, haditsSearchSchema);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useHaditsDetail(slug: string | null, nomor: number | null) {
  return useQuery({
    queryKey: haditsKeys.detail(slug ?? "", nomor ?? 0),
    enabled: !!slug && !!nomor,
    queryFn: () =>
      fetchHadits<Hadits>(`/api/hadits/${slug}/${nomor}`, haditsSchema),
    staleTime: 1000 * 60 * 60 * 24,
  });
}
