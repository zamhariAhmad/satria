"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { PrayerSchedule } from "@/features/spiritual/schemas/prayer";

export type PrayerScheduleParams = {
  city?: string;
  lat?: number;
  lon?: number;
};

export const spiritualKeys = {
  prayer: (params: PrayerScheduleParams = {}) =>
    [
      "spiritual",
      "prayer",
      params.city ?? null,
      params.lat ?? null,
      params.lon ?? null,
    ] as const,
};

export function usePrayerSchedule(params: PrayerScheduleParams = {}) {
  return useQuery({
    queryKey: spiritualKeys.prayer(params),
    queryFn: () =>
      apiFetch<PrayerSchedule>("/spiritual/prayer-schedule", {
        query: {
          city: params.city,
          lat: params.lat,
          lon: params.lon,
        },
      }),
    staleTime: 1000 * 60 * 30,
  });
}
