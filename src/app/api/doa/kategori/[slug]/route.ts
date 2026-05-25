import { type NextRequest } from "next/server";
import {
  asJsonOrError,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "10";
  try {
    const res = await sanusiFetch(
      `doa/kategori/${slug}?page=${page}&limit=${limit}`,
    );
    return await asJsonOrError(res, `Doa kategori ${slug}`);
  } catch (err) {
    return networkErrorResponse(err);
  }
}
