import { NextResponse } from "next/server";
import {
  asJsonOrError,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

const SLUG_RE = /^[a-z][a-z0-9_]*$/;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_SLUG", message: "Slug kitab tidak valid" },
      },
      { status: 400 },
    );
  }
  const url = new URL(req.url);
  const search = new URLSearchParams();
  const page = url.searchParams.get("page");
  if (page) search.set("page", page);
  const limit = url.searchParams.get("limit");
  if (limit) search.set("limit", limit);

  try {
    const path = `hadits/${slug}${search.size > 0 ? `?${search.toString()}` : ""}`;
    const res = await sanusiFetch(path, { next: { revalidate: 3600 } });
    return await asJsonOrError(res, `Daftar hadits ${slug}`);
  } catch (err) {
    return networkErrorResponse(err);
  }
}
