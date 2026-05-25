import HaditsKitabPage from "./_page-client";

const SANUSI_BASE =
  process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_URL ?? "https://api.ahmadsanusi.com/v1";
const SANUSI_API_KEY = process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_KEY ?? "";

const FALLBACK_SLUGS = [
  "musnad_ahmad", "shahih_bukhari", "sunan_nasai", "shahih_muslim",
  "sunan_abu_daud", "sunan_ibnu_majah", "sunan_tirmidzi",
  "musnad_syafii", "riyadhus_shalihin_arab", "riyadhus_shalihin",
];

export async function generateStaticParams() {
  try {
    const res = await fetch(`${SANUSI_BASE}/hadits`, {
      headers: {
        Accept: "application/json",
        ...(SANUSI_API_KEY ? { "X-API-Key": SANUSI_API_KEY } : {}),
      },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return FALLBACK_SLUGS.map((slug) => ({ slug }));
    const json = (await res.json()) as {
      status?: string;
      data?: { kitab?: Array<{ slug: string }> };
    };
    const kitab = json?.data?.kitab;
    if (!Array.isArray(kitab) || kitab.length === 0) {
      return FALLBACK_SLUGS.map((slug) => ({ slug }));
    }
    return kitab.map((k) => ({ slug: k.slug }));
  } catch {
    return FALLBACK_SLUGS.map((slug) => ({ slug }));
  }
}

export default function Page() {
  return <HaditsKitabPage />;
}
