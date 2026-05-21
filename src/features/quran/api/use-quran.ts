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

type Envelope<T> = {
  data: T | null;
  error: { code: string; message: string } | null;
};

async function fetchQuran<T>(
  path: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T> {
  const res = await fetch(path, { headers: { Accept: "application/json" } });
  const text = await res.text();
  let json: Envelope<unknown>;
  try {
    json = text ? (JSON.parse(text) as Envelope<unknown>) : { data: null, error: null };
  } catch {
    throw new Error(`Quran proxy returned non-JSON: ${res.status}`);
  }
  if (!res.ok || json.error || json.data == null) {
    throw new Error(json.error?.message ?? `Quran proxy error: ${res.status}`);
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
    queryFn: () =>
      fetchQuran<SurahListItem[]>("/api/quran", z.array(surahListItemSchema)),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useSurah(number: number | undefined) {
  return useQuery({
    queryKey: quranKeys.surah(number ?? 0),
    enabled: !!number,
    queryFn: () =>
      fetchQuran<SurahDetail>(`/api/quran/${number}`, surahDetailSchema),
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
      fetchQuran<AyahDetail>(
        `/api/quran/${surahNumber}/${ayahNumber}`,
        ayahDetailSchema,
      ),
    staleTime: 1000 * 60 * 60 * 24,
  });
}
