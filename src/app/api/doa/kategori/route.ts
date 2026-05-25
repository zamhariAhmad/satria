import {
  asJsonOrError,
  networkErrorResponse,
  sanusiFetch,
} from "@/lib/sanusi";

export const revalidate = 86400;

export async function GET() {
  try {
    const res = await sanusiFetch("doa/kategori", {
      next: { revalidate: 86400 },
    });
    return await asJsonOrError(res, "Daftar kategori doa");
  } catch (err) {
    return networkErrorResponse(err);
  }
}
