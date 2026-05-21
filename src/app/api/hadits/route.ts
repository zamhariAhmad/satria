import {
  asJsonOrError,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

export const revalidate = 86400;

export async function GET() {
  try {
    const res = await sanusiFetch("hadits", { next: { revalidate: 86400 } });
    return await asJsonOrError(res, "Daftar kitab hadits");
  } catch (err) {
    return networkErrorResponse(err);
  }
}
