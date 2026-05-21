import { NextResponse } from "next/server";
import {
  asJsonOrError,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

const SLUG_RE = /^[a-z][a-z0-9_]*$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; nomor: string }> },
) {
  const { slug, nomor } = await params;
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_SLUG", message: "Slug kitab tidak valid" },
      },
      { status: 400 },
    );
  }
  const n = Number(nomor);
  if (!Number.isInteger(n) || n < 1) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_NOMOR", message: "Nomor hadits tidak valid" },
      },
      { status: 400 },
    );
  }

  try {
    const res = await sanusiFetch(`hadits/${slug}/${n}`, {
      next: { revalidate: 86400 },
    });
    return await asJsonOrError(res, `Hadits ${slug} #${n}`);
  } catch (err) {
    return networkErrorResponse(err);
  }
}
