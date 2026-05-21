import { NextResponse } from "next/server";

const UPSTREAM = "https://api.myquran.com/v3/sholat/kabkota/cari";

export async function POST(req: Request) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_BODY", message: "Body harus JSON dengan field keyword" },
      },
      { status: 400 },
    );
  }

  const keyword =
    body && typeof body === "object" && "keyword" in body
      ? String((body as { keyword: unknown }).keyword ?? "").trim()
      : "";

  if (!keyword) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "EMPTY_KEYWORD", message: "Keyword tidak boleh kosong" },
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ keyword }),
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: `UPSTREAM_${upstream.status}`,
            message: `Pencarian kabkota gagal (${upstream.status})`,
          },
        },
        { status: 502 },
      );
    }
    const json = await upstream.json();
    if (!json?.status) {
      return NextResponse.json(
        {
          data: [],
          error: null,
        },
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
