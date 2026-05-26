"use client";

import {
  MapPin,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Star,
  LocateFixed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { LoadingScreen } from "@/components/common/LoadingScreen";
import { ErrorScreen } from "@/components/common/ErrorScreen";
import { useGeolocation } from "@/features/spiritual/api/use-geolocation";
import { useReverseGeocode } from "@/features/spiritual/api/use-reverse-geocode";
import { useKabkotaResolver } from "@/features/spiritual/api/use-kabkota-resolver";
import { useJadwalToday } from "@/features/spiritual/api/use-sholat";
import type { SholatTimes } from "@/features/spiritual/schemas/sholat";

type PrayerName =
  | "imsak"
  | "subuh"
  | "terbit"
  | "dhuha"
  | "dzuhur"
  | "ashar"
  | "maghrib"
  | "isya";

type PrayerTime = { name: PrayerName; label: string; time: string };

const ICONS: Record<PrayerName, LucideIcon> = {
  imsak: Star,
  subuh: Sunrise,
  terbit: Sunrise,
  dhuha: Sun,
  dzuhur: Sun,
  ashar: Sun,
  maghrib: Sunset,
  isya: Moon,
};

const LABELS: Record<PrayerName, string> = {
  imsak: "Imsak",
  subuh: "Subuh",
  terbit: "Terbit",
  dhuha: "Dhuha",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Maghrib",
  isya: "Isya",
};

const MAIN_PRAYERS: PrayerName[] = [
  "subuh",
  "dzuhur",
  "ashar",
  "maghrib",
  "isya",
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildTimes(times: SholatTimes): PrayerTime[] {
  const order: PrayerName[] = [
    "imsak",
    "subuh",
    "terbit",
    "dhuha",
    "dzuhur",
    "ashar",
    "maghrib",
    "isya",
  ];
  return order.map((name) => ({
    name,
    label: LABELS[name],
    time: times[name],
  }));
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function findNextPrayer(times: PrayerTime[], nowMin: number): PrayerTime {
  const main = times.filter((t) => MAIN_PRAYERS.includes(t.name));
  const upcoming = main.find((t) => toMinutes(t.time) > nowMin);
  return upcoming ?? main[0];
}

function formatCountdown(diffMin: number) {
  if (diffMin < 0) diffMin += 24 * 60;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  if (h <= 0) return `${m} menit lagi`;
  return `${h} jam ${m} menit lagi`;
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Kab\./i, "Kab.")
    .replace(/Kota /i, "Kota ");
}

export function PrayerTimes() {
  const {
    coords,
    status: geoStatus,
    error: geoError,
    request,
  } = useGeolocation(true);

  const { data: place } = useReverseGeocode(
    coords ? { latitude: coords.latitude, longitude: coords.longitude } : null,
  );

  const detectedCity = place?.city;
  const { resolved, isResolving } = useKabkotaResolver(detectedCity);

  const {
    data: jadwal,
    isLoading: scheduleLoading,
    isError: scheduleError,
    refetch,
  } = useJadwalToday(resolved?.id);

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const todayTimes = useMemo<PrayerTime[] | null>(() => {
    if (!jadwal) return null;
    const key = todayKey();
    const entry =
      jadwal.jadwal[key] ?? Object.values(jadwal.jadwal)[0] ?? null;
    return entry ? buildTimes(entry) : null;
  }, [jadwal]);

  const next = useMemo(() => {
    if (!todayTimes || !now) return null;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return findNextPrayer(todayTimes, nowMin);
  }, [todayTimes, now]);

  const initialLoading =
    (!todayTimes && (geoStatus === "prompting" || isResolving || scheduleLoading));

  if (initialLoading) return <LoadingScreen />;

  if (!todayTimes) {
    return (
      <ErrorScreen
        onRetry={() => {
          if (geoStatus !== "granted") request();
          if (resolved?.id) refetch();
        }}
        description={
          geoStatus === "denied" || geoStatus === "unsupported"
            ? "Izinkan akses lokasi untuk menampilkan jadwal sholat."
            : scheduleError
              ? "Gagal mengambil jadwal sholat."
              : "Lokasi belum terdeteksi."
        }
      />
    );
  }

  const cityLabel = jadwal?.kabko
    ? titleCase(jadwal.kabko)
    : detectedCity
      ? detectedCity
      : "Mendeteksi lokasi…";

  const provLabel = jadwal?.prov
    ? titleCase(jadwal.prov)
    : place?.principalSubdivision;

  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const diff = next ? toMinutes(next.time) - nowMin : 0;

  const showRetryLocation =
    geoStatus === "denied" ||
    geoStatus === "unsupported" ||
    geoStatus === "error";

  return (
    <section
      aria-label="Jadwal Sholat"
      className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-xs text-primary-foreground/80">
            <MapPin className="h-3 w-3" aria-hidden />
            <span className="truncate">{cityLabel}</span>
            {provLabel && provLabel !== cityLabel ? (
              <span className="truncate text-primary-foreground/60">
                · {provLabel}
              </span>
            ) : null}
          </div>
          {next ? (
            <>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-primary-foreground/70">
                Sholat Berikutnya
              </p>
              <p className="text-2xl font-bold leading-tight">{next.label}</p>
              <p className="text-sm text-primary-foreground/90">
                {next.time} · {formatCountdown(diff)}
              </p>
            </>
          ) : null}
          {showRetryLocation ? (
            <button
              type="button"
              onClick={() => request()}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium hover:bg-white/25"
            >
              <LocateFixed className="h-3 w-3" aria-hidden />
              {geoStatus === "denied"
                ? "Aktifkan izin lokasi"
                : "Coba deteksi lokasi"}
            </button>
          ) : null}
          {geoError && geoStatus !== "granted" ? (
            <p className="mt-1 text-[10px] text-primary-foreground/70">
              {geoError}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full bg-white/15 p-3">
            {next ? (
              (() => {
                const Icon = ICONS[next.name] ?? Sun;
                return <Icon className="h-6 w-6" aria-hidden />;
              })()
            ) : (
              <Sun className="h-6 w-6" aria-hidden />
            )}
          </div>
          {geoStatus === "granted" ? (
            <button
              type="button"
              onClick={() => request()}
              aria-label="Perbarui lokasi"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white/90 hover:bg-white/25"
            >
              <LocateFixed className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-5 divide-x divide-white/20 border-t border-white/20 bg-white/5">
        {todayTimes
          .filter((t) => MAIN_PRAYERS.includes(t.name))
          .map((t) => {
            const Icon = ICONS[t.name] ?? Sun;
            const isNext = next?.name === t.name;
            return (
              <div
                key={t.name}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-center",
                  isNext && "bg-white/15",
                )}
              >
                <Icon className="h-4 w-4 opacity-90" aria-hidden />
                <p className="text-[10px] uppercase tracking-wide text-primary-foreground/80">
                  {t.label}
                </p>
                <p className="text-xs font-semibold">{t.time}</p>
              </div>
            );
          })}
      </div>
    </section>
  );
}
