import { type NextRequest } from "next/server";
import {
  asJsonOrError,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const res = await sanusiFetch(`doa/${id}`);
    return await asJsonOrError(res, `Detail doa ${id}`);
  } catch (err) {
    return networkErrorResponse(err);
  }
}
