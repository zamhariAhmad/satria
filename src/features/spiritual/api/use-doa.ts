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

const SANUSI_BASE =
  process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_URL ?? "https://api.ahmadsanusi.com/v1";
const SANUSI_API_KEY = process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_KEY ?? "";

type SanusiResponse = {
  status?: string;
  data?: unknown;
  message?: string;
};

async function fetchDoa<T>(
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
    throw new Error(`Doa API error: ${res.status}`);
  }
  let json: SanusiResponse;
  try {
    json = (await res.json()) as SanusiResponse;
  } catch {
    throw new Error(`Doa API returned non-JSON (${res.status})`);
  }
  if (!json?.status || json.data == null) {
    throw new Error(json?.message ?? `Doa API: data tidak tersedia`);
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

const STALE_STATIC = 1000 * 60 * 60 * 24; // 24 h
const STALE_PAGE   = 1000 * 60 * 60;       // 1 h
const STALE_SEARCH = 1000 * 60 * 10;       // 10 m
const GC_TIME      = 1000 * 60 * 60 * 24;  // 24 h

export function useDoaKategori() {
  return useQuery({
    queryKey: doaKeys.kategori,
    queryFn: () =>
      fetchDoa<DoaKategori[]>("doa/kategori", doaKategoriListSchema),
    staleTime: STALE_STATIC,
    gcTime: GC_TIME,
  });
}

export function useDoaByKategori(slug: string | null | undefined, page = 1, limit = 10) {
  return useQuery({
    queryKey: doaKeys.byKategori(slug ?? "", page, limit),
    enabled: !!slug,
    queryFn: () =>
      fetchDoa<DoaByKategori>(
        `doa/kategori/${slug}?page=${page}&limit=${limit}`,
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
        `doa/search?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
        doaSearchSchema,
        { cache: "no-store" },
      ),
    staleTime: STALE_SEARCH,
    gcTime: GC_TIME,
  });
}

export function useDoaDetail(id: number | null | undefined) {
  return useQuery({
    queryKey: doaKeys.detail(id ?? 0),
    enabled: !!id,
    queryFn: () => fetchDoa<DoaItem>(`doa/${id}`, doaItemSchema),
    staleTime: STALE_STATIC,
    gcTime: GC_TIME,
  });
}
