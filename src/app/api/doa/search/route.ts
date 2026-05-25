import { type NextRequest } from "next/server";
import {
  asJsonOrError,
  badRequest,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = searchParams.get("limit") ?? "20";
  if (!q || q.trim().length === 0) {
    return badRequest("Parameter q wajib diisi");
  }
  try {
    const res = await sanusiFetch(
      `doa/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    );
    return await asJsonOrError(res, "Pencarian doa");
  } catch (err) {
    return networkErrorResponse(err);
  }
}
