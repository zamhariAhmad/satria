import { http, HttpResponse, delay } from "msw";
import { env } from "@/config/env";

const base = env.apiBaseUrl;

function todayIso() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function hijriToday() {
  try {
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "—";
  }
}

// Deterministic small offset so different locations get slightly different
// schedules without needing a real prayer-time engine.
function offsetFromCoords(lat: number | null, lon: number | null) {
  if (lat == null || lon == null) return 0;
  return Math.round(((lon - 106.85) / 15) * 60); // approx longitude → minutes
}

function shift(time: string, offsetMin: number) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + offsetMin;
  const norm = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(norm / 60)
    .toString()
    .padStart(2, "0");
  const mm = (norm % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

const BASE_TIMES: Array<{ name: string; label: string; time: string }> = [
  { name: "imsak", label: "Imsak", time: "04:24" },
  { name: "subuh", label: "Subuh", time: "04:34" },
  { name: "terbit", label: "Terbit", time: "05:52" },
  { name: "dhuha", label: "Dhuha", time: "06:18" },
  { name: "dzuhur", label: "Dzuhur", time: "11:54" },
  { name: "ashar", label: "Ashar", time: "15:16" },
  { name: "maghrib", label: "Maghrib", time: "17:48" },
  { name: "isya", label: "Isya", time: "19:01" },
];

export const spiritualHandlers = [
  http.get(`${base}/spiritual/prayer-schedule`, async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const cityParam = url.searchParams.get("city");
    const latParam = url.searchParams.get("lat");
    const lonParam = url.searchParams.get("lon");
    const lat = latParam ? Number(latParam) : null;
    const lon = lonParam ? Number(lonParam) : null;
    const offset = offsetFromCoords(lat, lon);

    return HttpResponse.json({
      data: {
        city: cityParam || "Jakarta",
        date: todayIso(),
        hijriDate: hijriToday(),
        coords:
          lat != null && lon != null ? { lat, lon } : null,
        times: BASE_TIMES.map((t) => ({ ...t, time: shift(t.time, offset) })),
      },
      error: null,
    });
  }),
];
