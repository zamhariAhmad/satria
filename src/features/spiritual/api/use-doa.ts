"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  doaByKategoriSchema,
  doaItemSchema,
  doaKategoriListSchema,
  doaSearchSchema,
  type DoaByKategori,
  type DoaItem,
  type DoaKategori,
  type DoaSearch,
} from "@/features/spiritual/schemas/doa";

type Envelope<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

async function fetchDoa<T>(
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
    throw new Error(`Doa proxy returned non-JSON (${res.status})`);
  }
  if (!res.ok || json.error || json.data == null) {
    throw new Error(json.error?.message ?? `Doa proxy error: ${res.status}`);
  }
  const parsed = schema.safeParse(json.data);
  if (!parsed.success) {
    throw new Error(`Bentuk data doa tidak sesuai: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const doaKeys = {
  kategori: ["doa", "kategori"] as const,
  byKategori: (slug: string, page: number, limit: number) =>
    ["doa", "kategori", slug, page, limit] as const,
  search: (q: string, limit: number) => ["doa", "search", q, limit] as const,
  detail: (id: number) => ["doa", "detail", id] as const,
};

// Doa data changes rarely; keep it fresh for 24 hours to avoid redundant
// network requests. gcTime matches so the data stays in memory for the whole
// session even if the component unmounts (e.g. navigating between pages).
const STALE_STATIC = 1000 * 60 * 60 * 24; // 24 h — kategori & detail
const STALE_PAGE   = 1000 * 60 * 60;       // 1 h  — paginated list
const STALE_SEARCH = 1000 * 60 * 10;       // 10 m — search results
const GC_TIME      = 1000 * 60 * 60 * 24;  // 24 h — keep in memory / persist

export function useDoaKategori() {
  return useQuery({
    queryKey: doaKeys.kategori,
    queryFn: () =>
      fetchDoa<DoaKategori[]>("/api/doa/kategori", doaKategoriListSchema),
    staleTime: STALE_STATIC,
    gcTime: GC_TIME,
  });
}

export function useDoaByKategori(
  slug: string | null | undefined,
  page = 1,
  limit = 10,
) {
  return useQuery({
    queryKey: doaKeys.byKategori(slug ?? "", page, limit),
    enabled: !!slug,
    queryFn: () =>
      fetchDoa<DoaByKategori>(
        `/api/doa/kategori/${slug}?page=${page}&limit=${limit}`,
        doaByKategoriSchema,
      ),
    staleTime: STALE_PAGE,
    gcTime: GC_TIME,
  });
}

export function useDoaSearch(q: string, limit = 20) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: doaKeys.search(trimmed.toLowerCase(), limit),
    enabled: trimmed.length >= 2,
    queryFn: () =>
      fetchDoa<DoaSearch>(
        `/api/doa/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
        doaSearchSchema,
      ),
    staleTime: STALE_SEARCH,
    gcTime: GC_TIME,
  });
}

export function useDoaDetail(id: number | null | undefined) {
  return useQuery({
    queryKey: doaKeys.detail(id ?? 0),
    enabled: !!id,
    queryFn: () => fetchDoa<DoaItem>(`/api/doa/${id}`, doaItemSchema),
    staleTime: STALE_STATIC,
    gcTime: GC_TIME,
  });
}
