"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  kabkotaListSchema,
  sholatJadwalTodaySchema,
  type KabkotaItem,
  type SholatJadwalToday,
} from "@/features/spiritual/schemas/sholat";

type Envelope<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

async function parseEnvelope<T>(
  res: Response,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T> {
  const text = await res.text();
  let json: Envelope<unknown>;
  try {
    json = text ? (JSON.parse(text) as Envelope<unknown>) : { data: null, error: null };
  } catch {
    throw new Error(`Invalid JSON from sholat proxy (${res.status})`);
  }
  if (!res.ok || json.error || json.data == null) {
    throw new Error(json.error?.message ?? `Sholat proxy error: ${res.status}`);
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
      const res = await fetch("/api/sholat/kabkota/cari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: trimmed }),
      });
      return parseEnvelope<KabkotaItem[]>(res, kabkotaListSchema);
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useJadwalToday(id: string | null | undefined) {
  return useQuery({
    queryKey: sholatKeys.jadwalToday(id ?? ""),
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`/api/sholat/jadwal/${id}/today`);
      return parseEnvelope<SholatJadwalToday>(res, sholatJadwalTodaySchema);
    },
    staleTime: 1000 * 60 * 60,
  });
}