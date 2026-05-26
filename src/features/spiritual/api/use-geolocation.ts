"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GeoStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unsupported"
  | "error";

export type GeoCoords = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  obtainedAt: number;
};

const STORAGE_KEY = "satria-geo-coords-v2";
const STALE_AFTER_MS = 1000 * 60 * 10; // 10 minutes – shorter so location updates faster after moving

function loadCached(): GeoCoords | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoCoords;
    if (
      typeof parsed.latitude !== "number" ||
      typeof parsed.longitude !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveCached(coords: GeoCoords) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  } catch {
    /* ignore quota errors */
  }
}

export function useGeolocation(autoRequest = true) {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      setError("Geolocation tidak didukung oleh peramban ini.");
      return;
    }
    setStatus("prompting");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: GeoCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          obtainedAt: Date.now(),
        };
        setCoords(next);
        setStatus("granted");
        saveCached(next);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus("denied");
          setError("Izin lokasi ditolak.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setStatus("error");
          setError("Lokasi tidak tersedia. Coba lagi.");
        } else if (err.code === err.TIMEOUT) {
          setStatus("error");
          setError("Permintaan lokasi habis waktu.");
        } else {
          setStatus("error");
          setError(err.message || "Gagal mengambil lokasi.");
        }
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;

    const cached = loadCached();
    if (cached) {
      setCoords(cached);
      setStatus("granted");
      const fresh = Date.now() - cached.obtainedAt < STALE_AFTER_MS;
      if (fresh || !autoRequest) return;
    }
    if (autoRequest) request();
  }, [autoRequest, request]);

  return { coords, status, error, request } as const;
}
