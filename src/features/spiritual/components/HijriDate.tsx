"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";

const HIJRI_MONTHS_ID = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
];

const WEEKDAYS_ID: Record<string, string> = {
  Sunday: "Minggu",
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
};

function formatHijri(date: Date) {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).formatToParts(date);

    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "";

    const weekdayEn = get("weekday");
    const day = get("day");
    const monthIdx = Number(get("month"));
    const year = get("year").replace(/\D/g, "");

    const weekday = WEEKDAYS_ID[weekdayEn] ?? weekdayEn;
    const month = HIJRI_MONTHS_ID[monthIdx - 1] ?? "";

    if (!day || !month || !year) return "—";
    return `${weekday}, ${day} ${month} ${year} H`;
  } catch {
    return "—";
  }
}

function formatGregorian(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function HijriDate() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Calendar className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{formatHijri(now)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatGregorian(now)}
        </p>
      </div>
    </div>
  );
}
