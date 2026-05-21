import { NextResponse } from "next/server";

export const revalidate = 86400;

const UPSTREAM = "https://api.myquran.com/v3/quran";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number } = await params;
  const n = Number(number);
  if (!Number.isInteger(n) || n < 1 || n > 114) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_SURAH", message: "Surah number must be 1..114" },
      },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${UPSTREAM}/${n}`, {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: `UPSTREAM_${res.status}`,
            message: `Failed to fetch surah ${n} (${res.status})`,
          },
        },
        { status: 502 },
      );
    }
    const json = await res.json();
    if (!json?.status || !json?.data) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "UPSTREAM_INVALID",
            message: "Unexpected response shape from upstream",
          },
        },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: json.data, error: null });
  } catch (err) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "NETWORK",
          message: err instanceof Error ? err.message : "Network error",
        },
      },
      { status: 502 },
    );
  }
}
