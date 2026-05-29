"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

/**
 * Aladhan Daily Prayer Times API
 * https://aladhan.com/prayer-times-api#tag/daily-prayer-times/GET/timings/{date}
 *
 * Menggunakan koordinat langsung agar bebas dari masalah pencocokan
 * nama kab/kota (mis. "Dau" → KAB. SEKADAU di provider sebelumnya).
 */
const ALADHAN_BASE = "https://api.aladhan.com/v1/timings";

// Method 20 = Kementerian Agama Republik Indonesia
const ALADHAN_METHOD = 20;

const aladhanTimingsSchema = z.object({
  Fajr: z.string(),
  Sunrise: z.string(),
  Dhuhr: z.string(),
  Asr: z.string(),
  Maghrib: z.string(),
  Isha: z.string(),
  Imsak: z.string(),
});

const aladhanResponseSchema = z.object({
  code: z.number(),
  data: z.object({
    timings: aladhanTimingsSchema,
    meta: z
      .object({
        timezone: z.string().optional(),
      })
      .optional(),
  }),
});

export type PrayerTimings = {
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  timezone?: string;
};

function ddmmyyyy(date: Date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

function stripSuffix(time: string) {
  // Aladhan kadang mengembalikan "04:13 (WIB)" — ambil bagian HH:mm saja.
  return time.replace(/\s*\(.*\)\s*$/, "").trim();
}

function shiftTime(time: string, offsetMin: number): string {
  const [hStr, mStr] = stripSuffix(time).split(":");
  const total =
    (Number(hStr) * 60 + Number(mStr) + offsetMin + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export const aladhanKeys = {
  timings: (lat: number | null, lon: number | null, date: string) =>
    ["aladhan", "timings", lat, lon, date] as const,
};

export function useTodayPrayerTimings(
  coords: { latitude: number; longitude: number } | null,
) {
  const today = ddmmyyyy(new Date());
  const lat = coords ? Math.round(coords.latitude * 1000) / 1000 : null;
  const lon = coords ? Math.round(coords.longitude * 1000) / 1000 : null;

  return useQuery({
    queryKey: aladhanKeys.timings(lat, lon, today),
    enabled: !!coords,
    queryFn: async (): Promise<PrayerTimings> => {
      const url = new URL(`${ALADHAN_BASE}/${today}`);
      url.searchParams.set("latitude", String(coords!.latitude));
      url.searchParams.set("longitude", String(coords!.longitude));
      url.searchParams.set("method", String(ALADHAN_METHOD));

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(`Aladhan API error: ${res.status}`);
      }
      const json = await res.json();
      const parsed = aladhanResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error("Bentuk respons Aladhan tidak sesuai");
      }
      const t = parsed.data.data.timings;
      const sunrise = stripSuffix(t.Sunrise);
      return {
        imsak: stripSuffix(t.Imsak),
        subuh: stripSuffix(t.Fajr),
        terbit: sunrise,
        // Aladhan tidak menyediakan Dhuha. Konvensi: ~15 menit setelah terbit.
        dhuha: shiftTime(sunrise, 15),
        dzuhur: stripSuffix(t.Dhuhr),
        ashar: stripSuffix(t.Asr),
        maghrib: stripSuffix(t.Maghrib),
        isya: stripSuffix(t.Isha),
        timezone: parsed.data.data.meta?.timezone,
      };
    },
    staleTime: 1000 * 60 * 60, // 1 jam
    refetchOnWindowFocus: false,
  });
}
