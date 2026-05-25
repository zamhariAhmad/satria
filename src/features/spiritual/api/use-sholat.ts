"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  kabkotaListSchema,
  sholatJadwalTodaySchema,
  type KabkotaItem,
  type SholatJadwalToday,
} from "@/features/spiritual/schemas/sholat";

const SHOLAT_BASE = "https://api.myquran.com/v3/sholat";

type MyQuranResponse = {
  status?: boolean | string;
  data?: unknown;
  message?: string;
};

async function parseSholatResponse<T>(
  res: Response,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T> {
  if (!res.ok) {
    throw new Error(`Sholat API error: ${res.status}`);
  }
  let json: MyQuranResponse;
  try {
    json = (await res.json()) as MyQuranResponse;
  } catch {
    throw new Error(`Sholat API returned non-JSON (${res.status})`);
  }
  if (!json?.status || json.data == null) {
    throw new Error(json?.message ?? `Sholat API: data tidak tersedia`);
  }
  const parsed = schema.safeParse(json.data);
  if (!parsed.success) {
    throw new Error(`Bentuk data sholat tidak sesuai: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const sholatKeys = {
  search: (keyword: string) => ["sholat", "kabkota", "search", keyword] as const,
  jadwalToday: (id: string) => ["sholat", "jadwal", "today", id] as const,
};

export function useSearchKabkota(keyword: string | undefined) {
  const trimmed = (keyword ?? "").trim();
  return useQuery({
    queryKey: sholatKeys.search(trimmed.toLowerCase()),
    enabled: trimmed.length >= 2,
    queryFn: async () => {
      const res = await fetch(`${SHOLAT_BASE}/kabkota/cari/${encodeURIComponent(trimmed)}`, {
        headers: { Accept: "application/json" },
      });
      return parseSholatResponse<KabkotaItem[]>(res, kabkotaListSchema);
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useJadwalToday(id: string | null | undefined) {
  return useQuery({
    queryKey: sholatKeys.jadwalToday(id ?? ""),
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`${SHOLAT_BASE}/jadwal/${id}/today`, {
        headers: { Accept: "application/json" },
      });
      return parseSholatResponse<SholatJadwalToday>(res, sholatJadwalTodaySchema);
    },
    staleTime: 1000 * 60 * 60,
  });
}
