import { NextResponse } from "next/server";

const UPSTREAM =
  process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_URL ??
  "https://api.ahmadsanusi.com/v1";
const API_KEY = process.env.NEXT_PUBLIC_AHMAD_SANUSI_API_KEY ?? "";

type Init = RequestInit & { next?: { revalidate?: number } };

export async function sanusiFetch(path: string, init: Init = {}) {
  const url = `${UPSTREAM.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      "X-API-Key": API_KEY,
      ...(init.headers ?? {}),
    },
  });
}

export function ok<T>(data: T) {
  return NextResponse.json({ data, error: null });
}

export function badGateway(message: string, code = "UPSTREAM_INVALID") {
  return NextResponse.json(
    { data: null, error: { code, message } },
    { status: 502 },
  );
}

export function badRequest(message: string, code = "INVALID_REQUEST") {
  return NextResponse.json(
    { data: null, error: { code, message } },
    { status: 400 },
  );
}

export async function asJsonOrError(res: Response, label: string) {
  if (!res.ok) {
    return badGateway(
      `${label} gagal (${res.status})`,
      `UPSTREAM_${res.status}`,
    );
  }
  let body: { status?: string; data?: unknown; message?: string } | null =
    null;
  try {
    body = await res.json();
  } catch {
    return badGateway(`${label}: respons tidak valid`);
  }
  if (!body || body.status !== "success" || !body.data) {
    return badGateway(body?.message ?? `${label}: data tidak tersedia`);
  }
  return ok(body.data);
}

export function networkErrorResponse(err: unknown) {
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
