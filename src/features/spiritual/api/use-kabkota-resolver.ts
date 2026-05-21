"use client";

import { useEffect, useState } from "react";
import type { KabkotaItem } from "@/features/spiritual/schemas/sholat";
import { useSearchKabkota } from "@/features/spiritual/api/use-sholat";

const STORAGE_KEY = "satria-kabkota-v1";

type StoredKabkota = {
  id: string;
  lokasi: string;
  matchedFor: string;
};

function loadCached(): StoredKabkota | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredKabkota;
  } catch {
    return null;
  }
}

function saveCached(value: StoredKabkota) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/**
 * Pick the best matching kabkota for a given user-facing city name.
 *
 * The myquran search may return several rows for one keyword (e.g. "malang"
 * yields KAB. PEMALANG, KAB. MALANG, KOTA MALANG). We score by:
 *   1. Exact word match on the city name.
 *   2. Prefer "KOTA" prefix when caller signals city; otherwise prefer
 *      whichever entry keyword appears as a whole word.
 *   3. Otherwise fall back to the shortest lokasi (most specific).
 */
function pickBestMatch(
  items: KabkotaItem[],
  keyword: string,
  preferKota: boolean,
): KabkotaItem | null {
  if (items.length === 0) return null;
  const k = keyword.trim().toUpperCase();
  if (!k) return items[0];

  const wordRe = new RegExp(`(^|\\s)${k}($|\\s)`);
  const matches = items.filter((it) => wordRe.test(it.lokasi.toUpperCase()));
  const pool = matches.length > 0 ? matches : items;

  const ranked = [...pool].sort((a, b) => {
    const aIsKota = a.lokasi.toUpperCase().startsWith("KOTA ");
    const bIsKota = b.lokasi.toUpperCase().startsWith("KOTA ");
    if (preferKota && aIsKota !== bIsKota) return aIsKota ? -1 : 1;
    if (!preferKota && aIsKota !== bIsKota) return aIsKota ? 1 : -1;
    return a.lokasi.length - b.lokasi.length;
  });

  return ranked[0] ?? null;
}

/**
 * Resolve the kabkota id for a given user-facing city name. The hook persists
 * the last successful pick in localStorage so subsequent loads are instant.
 */
export function useKabkotaResolver(city: string | null | undefined) {
  const [resolved, setResolved] = useState<StoredKabkota | null>(() =>
    loadCached(),
  );

  const trimmed = (city ?? "").trim();
  const search = useSearchKabkota(trimmed);

  useEffect(() => {
    if (!trimmed) return;
    if (!search.data) return;
    const best = pickBestMatch(search.data, trimmed, true);
    if (!best) return;
    if (
      resolved &&
      resolved.id === best.id &&
      resolved.matchedFor === trimmed.toLowerCase()
    ) {
      return;
    }
    const next: StoredKabkota = {
      id: best.id,
      lokasi: best.lokasi,
      matchedFor: trimmed.toLowerCase(),
    };
    setResolved(next);
    saveCached(next);
  }, [search.data, trimmed, resolved]);

  return {
    resolved,
    isResolving: search.isFetching && !resolved,
    isError: search.isError,
    error: search.error instanceof Error ? search.error.message : null,
  };
}
