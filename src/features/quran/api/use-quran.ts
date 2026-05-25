"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  surahListItemSchema,
  surahDetailSchema,
  ayahDetailSchema,
  type SurahDetail,
  type SurahListItem,
  type AyahDetail,
} from "@/features/quran/schemas/quran";

const QURAN_BASE = "https://api.myquran.com/v3/quran";

type MyQuranResponse = {
  status?: boolean | string;
  data?: unknown;
  message?: string;
};

async function fetchQuran<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T> {
  const res = await fetch(`${QURAN_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Quran API error: ${res.status}`);
  }
  let json: MyQuranResponse;
  try {
    json = (await res.json()) as MyQuranResponse;
  } catch {
    throw new Error(`Quran API returned non-JSON: ${res.status}`);
  }
  if (!json?.status || json.data == null) {
    throw new Error(json?.message ?? `Quran API: data tidak tersedia`);
  }
  const parsed = schema.safeParse(json.data);
  if (!parsed.success) {
    throw new Error(`Invalid quran response shape: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const quranKeys = {
  surahs: ["quran", "surahs"] as const,
  surah: (n: number) => ["quran", "surah", n] as const,
  ayah: (n: number, a: number) => ["quran", "ayah", n, a] as const,
};

export function useSurahs() {
  return useQuery({
    queryKey: quranKeys.surahs,
    queryFn: () => fetchQuran<SurahListItem[]>("", z.array(surahListItemSchema)),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useSurah(number: number | undefined) {
  return useQuery({
    queryKey: quranKeys.surah(number ?? 0),
    enabled: !!number,
    queryFn: () => fetchQuran<SurahDetail>(`/${number}`, surahDetailSchema),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useAyah(
  surahNumber: number | undefined,
  ayahNumber: number | undefined,
) {
  return useQuery({
    queryKey: quranKeys.ayah(surahNumber ?? 0, ayahNumber ?? 0),
    enabled: !!surahNumber && !!ayahNumber,
    queryFn: () =>
      fetchQuran<AyahDetail>(`/${surahNumber}/${ayahNumber}`, ayahDetailSchema),
    staleTime: 1000 * 60 * 60 * 24,
  });
}
