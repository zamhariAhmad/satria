import { NextResponse } from "next/server";
import {
  asJsonOrError,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "EMPTY_KEYWORD",
          message: "Keyword pencarian tidak boleh kosong",
        },
      },
      { status: 400 },
    );
  }
  const search = new URLSearchParams();
  search.set("q", q);
  const kitab = url.searchParams.get("kitab");
  if (kitab) search.set("kitab", kitab);
  const page = url.searchParams.get("page");
  if (page) search.set("page", page);
  const limit = url.searchParams.get("limit");
  if (limit) search.set("limit", limit);

  try {
    const res = await sanusiFetch(`hadits/search?${search.toString()}`, {
      cache: "no-store",
    });
    return await asJsonOrError(res, "Pencarian hadits");
  } catch (err) {
    return networkErrorResponse(err);
  }
}
