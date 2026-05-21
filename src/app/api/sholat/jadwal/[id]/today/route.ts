import { NextResponse } from "next/server";

const UPSTREAM = "https://api.myquran.com/v3/sholat/jadwal";

export const revalidate = 3600;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || !/^[a-f0-9]{8,64}$/i.test(id)) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_ID", message: "ID kabkota tidak valid" },
      },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${UPSTREAM}/${id}/today`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!upstream.ok) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: `UPSTREAM_${upstream.status}`,
            message: `Gagal mengambil jadwal (${upstream.status})`,
          },
        },
        { status: 502 },
      );
    }
    const json = await upstream.json();
    if (!json?.status || !json?.data) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "UPSTREAM_INVALID",
            message: json?.message ?? "Jadwal tidak tersedia",
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
