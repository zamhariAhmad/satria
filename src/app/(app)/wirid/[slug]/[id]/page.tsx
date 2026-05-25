import WiridDetailPage from "./_page-client";

export const dynamic = "force-static";

const SANUSI_BASE = process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_URL ?? "https://api.ahmadsanusi.com/v1";
const SANUSI_API_KEY = process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_KEY ?? "";

const HEADERS: HeadersInit = {
  Accept: "application/json",
  ...(SANUSI_API_KEY ? { "X-API-Key": SANUSI_API_KEY } : {}),
};

const SLUGS = [
  "doa-harian",
  "dzikir-pagi",
  "dzikir-petang",
  "dzikir-setelah-shalat",
  "doa-pilihan",
];

async function fetchAllIdsForSlug(slug: string): Promise<{ slug: string; id: string }[]> {
  try {
    // First fetch to get total count
    const first = await fetch(
      `${SANUSI_BASE}/doa/kategori/${slug}?page=1&limit=1`,
      { headers: HEADERS },
    );
    if (!first.ok) return [];
    const firstJson = await first.json() as { data?: { total?: number } };
    const total = firstJson?.data?.total ?? 0;
    if (total === 0) return [];

    // Fetch all in one request
    const all = await fetch(
      `${SANUSI_BASE}/doa/kategori/${slug}?page=1&limit=${total}`,
      { headers: HEADERS },
    );
    if (!all.ok) return [];
    const allJson = await all.json() as { data?: { doa?: { id: number }[] } };
    const items = allJson?.data?.doa ?? [];
    return items.map((item) => ({ slug, id: String(item.id) }));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const results = await Promise.all(SLUGS.map(fetchAllIdsForSlug));
  const params = results.flat();
  // Fallback so the build doesn't fail if the API is unreachable
  if (params.length === 0) {
    return SLUGS.map((slug) => ({ slug, id: "0" }));
  }
  return params;
}

export default function Page() {
  return <WiridDetailPage />;
}
