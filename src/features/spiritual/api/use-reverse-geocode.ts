"use client";

import { useQuery } from "@tanstack/react-query";

export type ReverseGeocode = {
  city: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
};

type AdminEntry = {
  order?: number;
  adminLevel?: number;
  name?: string;
  isoName?: string;
};

type BigDataCloudResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  countryCode?: string;
  localityInfo?: {
    administrative?: AdminEntry[];
  };
};

function pickByLevel(entries: AdminEntry[] | undefined, level: number) {
  return entries?.find((e) => e.adminLevel === level)?.name;
}

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<ReverseGeocode> {
  const url = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client",
  );
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("localityLanguage", "id");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Reverse geocode error: ${res.status}`);
  }
  const json = (await res.json()) as BigDataCloudResponse;
  const admin = json.localityInfo?.administrative;

  // BigDataCloud's top-level `city` field is generally well-curated and
  // returns the kota/kabupaten directly (e.g. "Malang", "Yogyakarta",
  // "Jakarta"). Fall back to admin levels only when it is missing.
  // adminLevel 5 = kota/kabupaten, adminLevel 4 = provinsi.
  const cityFromAdmin = pickByLevel(admin, 5) ?? pickByLevel(admin, 6);
  const provinceFromAdmin =
    pickByLevel(admin, 4) ?? pickByLevel(admin, 3) ?? json.principalSubdivision;

  const city =
    json.city ||
    cityFromAdmin ||
    json.locality ||
    provinceFromAdmin ||
    "Lokasi tidak diketahui";

  return {
    city,
    locality: json.locality,
    principalSubdivision: provinceFromAdmin,
    countryName: json.countryName,
    countryCode: json.countryCode,
  };
}

export function useReverseGeocode(
  coords: { latitude: number; longitude: number } | null,
) {
  return useQuery({
    queryKey: [
      "geocode",
      coords ? Math.round(coords.latitude * 100) / 100 : null,
      coords ? Math.round(coords.longitude * 100) / 100 : null,
    ],
    enabled: !!coords,
    queryFn: () => reverseGeocode(coords!.latitude, coords!.longitude),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
